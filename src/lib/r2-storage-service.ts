import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Tipos de error
export enum R2ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  STORAGE_FULL = 'STORAGE_FULL',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  R2_TEMPORARILY_UNAVAILABLE = 'R2_TEMPORARILY_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Interfaz para resultado de operaciones
export interface R2OperationResult {
  success: boolean;
  url?: string;
  error?: string;
  errorType?: R2ErrorType;
  retries?: number;
}

// Interfaz para operaciones batch
export interface R2BatchResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  results: Array<{ fileName: string; success: boolean; url?: string; error?: string }>;
}

// Configuración de reintentos
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,  // 1 segundo
  maxDelay: 8000,   // 8 segundos
  retryableErrors: [
    R2ErrorType.NETWORK_ERROR,
    R2ErrorType.TIMEOUT_ERROR,
    R2ErrorType.R2_TEMPORARILY_UNAVAILABLE
  ]
};

export class R2StorageService {
  private static client: S3Client;
  private static bucketName = process.env.R2_BUCKET_NAME || '';
  private static publicUrl = process.env.R2_PUBLIC_URL || '';
  private static readonly UPLOAD_TIMEOUT = 30000; // 30 segundos

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

  /**
   * Categoriza el error para determinar si es reintentar o no
   */
  private static categorizeError(error: any): R2ErrorType {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.Code || error?.name || '';

    // Errores de autenticación - no reintentar
    if (errorCode === 'InvalidAccessKeyId' || errorCode === 'SignatureDoesNotMatch' ||
        errorCode === 'AccessDenied' || errorCode === 'Forbidden') {
      return R2ErrorType.AUTH_ERROR;
    }

    // Bucket no existe
    if (errorCode === 'NoSuchBucket') {
      return R2ErrorType.NOT_FOUND;
    }

    // Storage lleno
    if (errorCode === 'StorageClassNotSupported' || errorMessage.includes('quota exceeded')) {
      return R2ErrorType.STORAGE_FULL;
    }

    // Errores de red - reintentar
    if (errorMessage.includes('network') || errorMessage.includes('econnrefused') ||
        errorMessage.includes('enotfound') || errorMessage.includes('etimedout')) {
      return R2ErrorType.NETWORK_ERROR;
    }

    // Timeout - reintentar
    if (errorMessage.includes('timeout') || errorCode === 'TimeoutError' || errorCode === 'RequestTimeout') {
      return R2ErrorType.TIMEOUT_ERROR;
    }

    // Servicio temporalmente no disponible - reintentar
    if (errorCode === 'ServiceUnavailable' || errorCode === 'SlowDown' || errorCode === '503') {
      return R2ErrorType.R2_TEMPORARILY_UNAVAILABLE;
    }

    return R2ErrorType.UNKNOWN_ERROR;
  }

  /**
   * Espera un tiempo con exponential backoff
   */
  private static async delay(attempt: number): Promise<void> {
    const delayMs = Math.min(RETRY_CONFIG.baseDelay * Math.pow(2, attempt), RETRY_CONFIG.maxDelay);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  /**
   * Sube un archivo a R2 con reintentos automáticos y manejo robusto de errores
   * @param buffer Buffer del archivo
   * @param fileName Nombre del archivo (incluyendo ruta/prefijo)
   * @param contentType Tipo MIME del archivo
   * @param maxRetries Número máximo de reintentos (default: 3)
   * @returns Resultado de la operación con URL o error
   */
  static async uploadFileWithRetry(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    maxRetries: number = RETRY_CONFIG.maxRetries
  ): Promise<R2OperationResult> {
    let lastError: any;
    let lastErrorType: R2ErrorType = R2ErrorType.UNKNOWN_ERROR;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const client = this.getClient();

        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: contentType,
        });

        // Configurar timeout
        const uploadPromise = client.send(command);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Upload timeout')), this.UPLOAD_TIMEOUT);
        });

        await Promise.race([uploadPromise, timeoutPromise]);

        // Verificar que el archivo se subió correctamente
        const exists = await this.verifyFileExists(fileName);
        if (!exists) {
          throw new Error('File verification failed after upload');
        }

        const url = `${this.publicUrl}/${fileName}`;

        console.log(`✅ Archivo subido exitosamente a R2: ${fileName} (intentos: ${attempt + 1})`);

        return {
          success: true,
          url,
          retries: attempt
        };

      } catch (error) {
        lastError = error;
        lastErrorType = this.categorizeError(error);

        console.error(`❌ Error en intento ${attempt + 1}/${maxRetries + 1} subiendo a R2:`, {
          fileName,
          errorType: lastErrorType,
          error: error instanceof Error ? error.message : String(error)
        });

        // Si no es reintentar, fallar inmediatamente
        if (!RETRY_CONFIG.retryableErrors.includes(lastErrorType)) {
          break;
        }

        // Si no es el último intento, esperar antes de reintentar
        if (attempt < maxRetries) {
          await this.delay(attempt);
          console.log(`🔄 Reintentando subida de ${fileName}...`);
        }
      }
    }

    // Todos los intentos fallaron
    return {
      success: false,
      error: lastError instanceof Error ? lastError.message : String(lastError),
      errorType: lastErrorType,
      retries: maxRetries
    };
  }

  /**
   * Verifica si un archivo existe en R2
   * @param fileName Nombre del archivo a verificar
   * @returns true si existe, false si no
   */
  static async verifyFileExists(fileName: string): Promise<boolean> {
    try {
      const client = this.getClient();

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await client.send(command);
      return true;
    } catch (error: any) {
      if (error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) {
        return false;
      }
      // Si es otro tipo de error, lanzarlo
      throw error;
    }
  }

  /**
   * Sube múltiples archivos en batch
   * @param files Array de archivos a subir
   * @returns Resultado del batch con detalles de cada archivo
   */
  static async uploadMultipleFiles(
    files: Array<{ buffer: Buffer; fileName: string; contentType: string }>
  ): Promise<R2BatchResult> {
    const results = await Promise.all(
      files.map(async (file) => {
        const result = await this.uploadFileWithRetry(file.buffer, file.fileName, file.contentType);
        return {
          fileName: file.fileName,
          success: result.success,
          url: result.url,
          error: result.error
        };
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      results
    };
  }

  /**
   * Elimina múltiples archivos en batch
   * @param fileNames Array de nombres de archivos a eliminar
   * @returns Resultado del batch con detalles
   */
  static async deleteMultipleFiles(fileNames: string[]): Promise<R2BatchResult> {
    const results = await Promise.all(
      fileNames.map(async (fileName) => {
        try {
          await this.deleteFile(fileName);
          return {
            fileName,
            success: true
          };
        } catch (error) {
          return {
            fileName,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      results
    };
  }

  /**
   * Prueba la conexión con R2
   * @returns true si la conexión es exitosa, false si falla
   */
  static async testConnection(): Promise<boolean> {
    try {
      const client = this.getClient();

      // Intentar subir un archivo de prueba muy pequeño
      const testFileName = `test-connection-${Date.now()}.txt`;
      const testBuffer = Buffer.from('test');

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: testFileName,
        Body: testBuffer,
        ContentType: 'text/plain',
      });

      await client.send(command);

      // Eliminar el archivo de prueba
      await this.deleteFile(testFileName);

      console.log('✅ Conexión con R2 exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error probando conexión con R2:', error);
      return false;
    }
  }
}
