import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export class R2StorageService {
  private static client: S3Client;
  private static bucketName = process.env.R2_BUCKET_NAME || '';
  private static publicUrl = process.env.R2_PUBLIC_URL || '';

  private static getClient(): S3Client {
    if (!this.client) {
      const accountId = process.env.R2_ACCOUNT_ID;
      const accessKeyId = process.env.R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
      const endpoint = process.env.R2_ENDPOINT;

      if (!accountId || !accessKeyId || !secretAccessKey || !endpoint) {
        throw new Error('Faltan variables de entorno para Cloudflare R2');
      }

      this.client = new S3Client({
        region: 'auto',
        endpoint: endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
    return this.client;
  }

  /**
   * Sube un archivo a Cloudflare R2
   * @param buffer Buffer del archivo
   * @param fileName Nombre del archivo (incluyendo ruta/prefijo si es necesario)
   * @param contentType Tipo MIME del archivo
   * @returns URL pública del archivo subido
   */
  static async uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
    try {
      const client = this.getClient();
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
      });

      await client.send(command);

      // Construir URL pública
      // Si fileName tiene carpetas, asegúrate de que la URL las refleje correctamente
      // R2_PUBLIC_URL debería ser la URL base, ej: https://pub-xxx.r2.dev
      const url = `${this.publicUrl}/${fileName}`;
      
      console.log(`✅ Archivo subido exitosamente a R2: ${fileName}`);
      return url;
    } catch (error) {
      console.error('❌ Error subiendo archivo a R2:', error);
      throw error;
    }
  }

  /**
   * Elimina un archivo de Cloudflare R2
   * @param fileName Nombre del archivo a eliminar
   */
  static async deleteFile(fileName: string): Promise<void> {
    try {
      const client = this.getClient();
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await client.send(command);
      console.log(`🗑️ Archivo eliminado de R2: ${fileName}`);
    } catch (error) {
      console.error('❌ Error eliminando archivo de R2:', error);
      throw error;
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   * @param fileName Nombre del archivo
   */
  static getPublicUrl(fileName: string): string {
    return `${this.publicUrl}/${fileName}`;
  }
}
