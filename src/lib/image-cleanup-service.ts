import { R2StorageService } from './r2-storage-service.js';
import { db } from './database.js';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

/**
 * Servicio para limpieza y mantenimiento de imágenes en R2
 * Detecta archivos huérfanos y permite limpieza programada
 */

export interface CleanupReport {
  success: boolean;
  totalFilesInR2: number;
  orphanedFiles: number;
  deletedFiles: number;
  errors: string[];
  fileList?: string[];
}

export class ImageCleanupService {
  /**
   * Obtiene todas las URLs de imágenes almacenadas en la base de datos
   */
  private static async getDatabaseImageUrls(): Promise<Set<string>> {
    const urls = new Set<string>();

    try {
      // Obtener URLs de fotos y firmas de pacientes
      const [patientImages] = await db.execute(
        'SELECT photo_path, signature_path FROM patients WHERE photo_path IS NOT NULL OR signature_path IS NOT NULL'
      ) as any[];

      for (const row of patientImages) {
        if (row.photo_path) urls.add(row.photo_path);
        if (row.signature_path) urls.add(row.signature_path);
      }

      // Obtener URLs de firmas de doctores
      const [doctorImages] = await db.execute(
        'SELECT signature_path FROM users WHERE role = "doctor" AND signature_path IS NOT NULL'
      ) as any[];

      for (const row of doctorImages) {
        if (row.signature_path) urls.add(row.signature_path);
      }

      console.log(`📊 Total URLs en base de datos: ${urls.size}`);
      return urls;

    } catch (error) {
      console.error('❌ Error obteniendo URLs de base de datos:', error);
      throw error;
    }
  }

  /**
   * Extrae el nombre de archivo (key) desde una URL completa de R2
   */
  private static extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Remover el '/' inicial del pathname
      return urlObj.pathname.substring(1);
    } catch (error) {
      console.error(`❌ Error extrayendo key de URL: ${url}`, error);
      return null;
    }
  }

  /**
   * Lista todos los archivos en el bucket de R2
   */
  private static async listAllFilesInR2(): Promise<string[]> {
    try {
      const accountId = process.env.R2_ACCOUNT_ID;
      const accessKeyId = process.env.R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
      const endpoint = process.env.R2_ENDPOINT;
      const bucketName = process.env.R2_BUCKET_NAME;

      if (!accountId || !accessKeyId || !secretAccessKey || !endpoint || !bucketName) {
        throw new Error('Faltan variables de entorno para R2');
      }

      const client = new S3Client({
        region: 'auto',
        endpoint: endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const files: string[] = [];
      let continuationToken: string | undefined;

      // Listar todos los archivos (puede ser paginado)
      do {
        const command = new ListObjectsV2Command({
          Bucket: bucketName,
          ContinuationToken: continuationToken
        });

        const response = await client.send(command);

        if (response.Contents) {
          for (const obj of response.Contents) {
            if (obj.Key) {
              files.push(obj.Key);
            }
          }
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      console.log(`📦 Total archivos en R2: ${files.length}`);
      return files;

    } catch (error) {
      console.error('❌ Error listando archivos en R2:', error);
      throw error;
    }
  }

  /**
   * Encuentra archivos huérfanos (en R2 pero no en BD)
   */
  static async findOrphanedFiles(): Promise<string[]> {
    try {
      console.log('🔍 Buscando archivos huérfanos en R2...');

      // Obtener todas las URLs en la BD
      const dbUrls = await this.getDatabaseImageUrls();

      // Convertir URLs a keys para comparación
      const dbKeys = new Set<string>();
      for (const url of dbUrls) {
        const key = this.extractKeyFromUrl(url);
        if (key) dbKeys.add(key);
      }

      // Obtener todos los archivos en R2
      const r2Files = await this.listAllFilesInR2();

      // Encontrar archivos que están en R2 pero no en BD
      const orphaned: string[] = [];

      for (const r2File of r2Files) {
        // Verificar si el archivo o alguna variación está en la BD
        const isReferenced = dbKeys.has(r2File);

        // También verificar variaciones comunes (thumbnails)
        const baseName = r2File.replace('_thumb.webp', '.webp').replace('_cert.webp', '.webp');
        const hasMainFile = dbKeys.has(baseName);

        if (!isReferenced && !hasMainFile) {
          orphaned.push(r2File);
        }
      }

      console.log(`🗑️ Archivos huérfanos encontrados: ${orphaned.length}`);
      return orphaned;

    } catch (error) {
      console.error('❌ Error buscando archivos huérfanos:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen antigua basada en su URL
   */
  static async deleteOldImage(url: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(url);
      if (!key) {
        console.error('❌ No se pudo extraer key de URL:', url);
        return false;
      }

      await R2StorageService.deleteFile(key);

      // Si es una foto de paciente, también intentar eliminar el thumbnail
      if (key.includes('/patients/') && !key.includes('_thumb.webp') && !key.includes('_cert.webp')) {
        const thumbKey = key.replace('.webp', '_thumb.webp');
        const certKey = key.replace('.webp', '_cert.webp');

        try {
          await R2StorageService.deleteFile(thumbKey);
        } catch (e) {
          // No es crítico si no existe
        }

        try {
          await R2StorageService.deleteFile(certKey);
        } catch (e) {
          // No es crítico si no existe
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ Error eliminando imagen: ${url}`, error);
      return false;
    }
  }

  /**
   * Ejecuta limpieza de archivos huérfanos
   * @param dryRun Si es true, solo reporta sin eliminar
   * @returns Reporte de limpieza
   */
  static async runCleanup(dryRun: boolean = false): Promise<CleanupReport> {
    const report: CleanupReport = {
      success: true,
      totalFilesInR2: 0,
      orphanedFiles: 0,
      deletedFiles: 0,
      errors: [],
      fileList: []
    };

    try {
      console.log(`🧹 Iniciando limpieza de archivos huérfanos (dryRun: ${dryRun})...`);

      // Obtener archivos huérfanos
      const orphanedFiles = await this.findOrphanedFiles();
      report.orphanedFiles = orphanedFiles.length;
      report.fileList = orphanedFiles;

      if (orphanedFiles.length === 0) {
        console.log('✅ No se encontraron archivos huérfanos');
        return report;
      }

      if (dryRun) {
        console.log('ℹ️ Modo dry-run: No se eliminarán archivos');
        console.log('📋 Archivos que serían eliminados:');
        orphanedFiles.forEach(file => console.log(`   - ${file}`));
        return report;
      }

      // Eliminar archivos huérfanos
      console.log(`🗑️ Eliminando ${orphanedFiles.length} archivos huérfanos...`);

      const deleteResults = await R2StorageService.deleteMultipleFiles(orphanedFiles);

      report.deletedFiles = deleteResults.successCount;
      report.errors = deleteResults.results
        .filter(r => !r.success)
        .map(r => `${r.fileName}: ${r.error}`);

      if (deleteResults.success) {
        console.log(`✅ Limpieza completada: ${report.deletedFiles} archivos eliminados`);
      } else {
        console.warn(`⚠️ Limpieza completada con errores: ${report.deletedFiles} eliminados, ${report.errors.length} errores`);
        report.success = false;
      }

      return report;

    } catch (error) {
      console.error('❌ Error durante la limpieza:', error);
      report.success = false;
      report.errors.push(error instanceof Error ? error.message : String(error));
      return report;
    }
  }

  /**
   * Obtiene estadísticas de uso de almacenamiento
   */
  static async getStorageStats(): Promise<{
    totalFiles: number;
    totalSizeBytes: number;
    totalSizeMB: number;
    filesByType: Record<string, number>;
  }> {
    try {
      const files = await this.listAllFilesInR2();

      const stats = {
        totalFiles: files.length,
        totalSizeBytes: 0,
        totalSizeMB: 0,
        filesByType: {} as Record<string, number>
      };

      // Contar por tipo
      for (const file of files) {
        let type = 'other';
        if (file.startsWith('patients/')) type = 'patient_photos';
        else if (file.startsWith('signatures/patient')) type = 'patient_signatures';
        else if (file.startsWith('signatures/doctor')) type = 'doctor_signatures';

        stats.filesByType[type] = (stats.filesByType[type] || 0) + 1;
      }

      return stats;

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}
