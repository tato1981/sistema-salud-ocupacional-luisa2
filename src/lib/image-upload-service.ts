import sharp from 'sharp';
import { R2StorageService, R2ErrorType, type R2OperationResult } from './r2-storage-service.js';
import { ImageProcessingService } from './image-processing-service.js';

// Tipos de imagen
export enum ImageType {
  PATIENT_PHOTO = 'PATIENT_PHOTO',
  PATIENT_SIGNATURE = 'PATIENT_SIGNATURE',
  DOCTOR_SIGNATURE = 'DOCTOR_SIGNATURE'
}

// Resultado de validación
export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: ValidationErrorCode;
}

export enum ValidationErrorCode {
  INVALID_FORMAT = 'INVALID_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  CORRUPTED_BUFFER = 'CORRUPTED_BUFFER',
  INVALID_CONTENT_TYPE = 'INVALID_CONTENT_TYPE'
}

// Resultado de upload
export interface UploadResult {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  originalSize?: number;
  optimizedSize?: number;
  format?: string;
  dimensions?: { width: number; height: number };
  error?: string;
  errorType?: string;
}

// Configuración de validación por tipo de imagen
const VALIDATION_CONFIG = {
  [ImageType.PATIENT_PHOTO]: {
    maxSizeMB: 5,
    minWidth: 100,
    minHeight: 100,
    maxWidth: 4000,
    maxHeight: 4000,
    allowedFormats: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  },
  [ImageType.PATIENT_SIGNATURE]: {
    maxSizeMB: 2,
    minWidth: 100,
    minHeight: 50,
    maxWidth: 2000,
    maxHeight: 1000,
    allowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  [ImageType.DOCTOR_SIGNATURE]: {
    maxSizeMB: 2,
    minWidth: 100,
    minHeight: 50,
    maxWidth: 2000,
    maxHeight: 1000,
    allowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  }
};

// Configuración de optimización por tipo
const OPTIMIZATION_CONFIG = {
  [ImageType.PATIENT_PHOTO]: {
    width: 400,
    height: 400,
    quality: 80,
    format: 'webp',
    thumbnailWidth: 150,
    thumbnailHeight: 150,
    thumbnailQuality: 75
  },
  [ImageType.PATIENT_SIGNATURE]: {
    width: 600,
    height: 200,
    quality: 80,
    format: 'webp',
    fit: 'contain' as const
  },
  [ImageType.DOCTOR_SIGNATURE]: {
    width: 600,
    height: 200,
    quality: 80,
    format: 'webp',
    fit: 'contain' as const
  }
};

export class ImageUploadService {
  /**
   * Valida un buffer de imagen antes de procesarla
   */
  private static async validateImage(buffer: Buffer, imageType: ImageType): Promise<ValidationResult> {
    try {
      const config = VALIDATION_CONFIG[imageType];

      // Validar tamaño del buffer
      const sizeMB = buffer.length / (1024 * 1024);
      if (sizeMB > config.maxSizeMB) {
        return {
          valid: false,
          error: `Imagen demasiado grande. Máximo permitido: ${config.maxSizeMB}MB`,
          errorCode: ValidationErrorCode.FILE_TOO_LARGE
        };
      }

      // Intentar leer metadatos con Sharp para validar integridad
      let metadata;
      try {
        metadata = await sharp(buffer).metadata();
      } catch (error) {
        return {
          valid: false,
          error: 'Imagen corrupta o formato no válido',
          errorCode: ValidationErrorCode.CORRUPTED_BUFFER
        };
      }

      // Validar formato
      if (!metadata.format || !config.allowedFormats.includes(metadata.format)) {
        return {
          valid: false,
          error: `Formato no permitido. Use: ${config.allowedFormats.join(', ')}`,
          errorCode: ValidationErrorCode.INVALID_FORMAT
        };
      }

      // Validar dimensiones
      if (metadata.width && metadata.height) {
        if (metadata.width < config.minWidth || metadata.height < config.minHeight) {
          return {
            valid: false,
            error: `Imagen muy pequeña. Mínimo: ${config.minWidth}x${config.minHeight}px`,
            errorCode: ValidationErrorCode.INVALID_DIMENSIONS
          };
        }

        if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
          return {
            valid: false,
            error: `Imagen muy grande. Máximo: ${config.maxWidth}x${config.maxHeight}px`,
            errorCode: ValidationErrorCode.INVALID_DIMENSIONS
          };
        }
      }

      return { valid: true };

    } catch (error) {
      console.error('Error validando imagen:', error);
      return {
        valid: false,
        error: 'Error interno al validar imagen',
        errorCode: ValidationErrorCode.CORRUPTED_BUFFER
      };
    }
  }

  /**
   * Optimiza una imagen según su tipo
   */
  private static async optimizeImage(
    buffer: Buffer,
    imageType: ImageType
  ): Promise<{ buffer: Buffer; thumbnailBuffer?: Buffer; originalSize: number; optimizedSize: number }> {
    const config = OPTIMIZATION_CONFIG[imageType];
    const originalSize = buffer.length;

    let optimizedBuffer: Buffer;
    let thumbnailBuffer: Buffer | undefined;

    // Procesar imagen principal
    if (imageType === ImageType.PATIENT_PHOTO) {
      // Para fotos de pacientes, usar el servicio existente
      const result = await ImageProcessingService.processImageBuffer(buffer, 'patient');
      optimizedBuffer = result.buffer;

      // Generar thumbnail para certificados
      const thumbResult = await ImageProcessingService.processImageBuffer(buffer, 'certificate');
      thumbnailBuffer = thumbResult.buffer;

    } else {
      // Para firmas, optimización personalizada
      optimizedBuffer = await sharp(buffer)
        .resize(config.width, config.height, {
          fit: config.fit || 'cover',
          position: 'center',
          withoutEnlargement: true // No agrandar imágenes pequeñas
        })
        .webp({ quality: config.quality })
        .toBuffer();
    }

    return {
      buffer: optimizedBuffer,
      thumbnailBuffer,
      originalSize,
      optimizedSize: optimizedBuffer.length
    };
  }

  /**
   * Genera un nombre de archivo único
   */
  private static generateFileName(imageType: ImageType, entityId: number | string, suffix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    let prefix: string;
    switch (imageType) {
      case ImageType.PATIENT_PHOTO:
        prefix = 'patients';
        break;
      case ImageType.PATIENT_SIGNATURE:
        prefix = 'signatures/patient';
        break;
      case ImageType.DOCTOR_SIGNATURE:
        prefix = 'signatures/doctor';
        break;
    }

    const suffixPart = suffix ? `_${suffix}` : '';
    return `${prefix}/${entityId}_${timestamp}_${random}${suffixPart}.webp`;
  }

  /**
   * Extrae el nombre del archivo desde una URL R2
   */
  private static extractFileNameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Eliminar el primer '/' del pathname
      return urlObj.pathname.substring(1);
    } catch (error) {
      console.error('Error extrayendo nombre de archivo de URL:', error);
      return null;
    }
  }

  /**
   * Sube una foto de paciente
   */
  static async uploadPatientPhoto(
    buffer: Buffer,
    patientId: number | string
  ): Promise<UploadResult> {
    try {
      // Validar
      const validation = await this.validateImage(buffer, ImageType.PATIENT_PHOTO);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          errorType: validation.errorCode
        };
      }

      // Optimizar
      const optimized = await this.optimizeImage(buffer, ImageType.PATIENT_PHOTO);

      // Generar nombres de archivo
      const mainFileName = this.generateFileName(ImageType.PATIENT_PHOTO, patientId);
      const thumbFileName = this.generateFileName(ImageType.PATIENT_PHOTO, patientId, 'thumb');

      // Subir imagen principal con reintentos
      const mainResult = await R2StorageService.uploadFileWithRetry(
        optimized.buffer,
        mainFileName,
        'image/webp'
      );

      if (!mainResult.success) {
        return {
          success: false,
          error: mainResult.error,
          errorType: mainResult.errorType
        };
      }

      // Subir thumbnail
      let thumbnailUrl: string | undefined;
      if (optimized.thumbnailBuffer) {
        const thumbResult = await R2StorageService.uploadFileWithRetry(
          optimized.thumbnailBuffer,
          thumbFileName,
          'image/webp'
        );
        thumbnailUrl = thumbResult.url;
      }

      // Obtener dimensiones
      const metadata = await sharp(optimized.buffer).metadata();

      return {
        success: true,
        url: mainResult.url,
        thumbnailUrl,
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        format: 'webp',
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0
        }
      };

    } catch (error) {
      console.error('Error subiendo foto de paciente:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        errorType: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Sube una firma de paciente
   */
  static async uploadPatientSignature(
    buffer: Buffer,
    patientId: number | string
  ): Promise<UploadResult> {
    try {
      // Validar
      const validation = await this.validateImage(buffer, ImageType.PATIENT_SIGNATURE);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          errorType: validation.errorCode
        };
      }

      // Optimizar
      const optimized = await this.optimizeImage(buffer, ImageType.PATIENT_SIGNATURE);

      // Generar nombre de archivo
      const fileName = this.generateFileName(ImageType.PATIENT_SIGNATURE, patientId);

      // Subir con reintentos
      const result = await R2StorageService.uploadFileWithRetry(
        optimized.buffer,
        fileName,
        'image/webp'
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          errorType: result.errorType
        };
      }

      const metadata = await sharp(optimized.buffer).metadata();

      return {
        success: true,
        url: result.url,
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        format: 'webp',
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0
        }
      };

    } catch (error) {
      console.error('Error subiendo firma de paciente:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        errorType: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Sube una firma de doctor
   */
  static async uploadDoctorSignature(
    buffer: Buffer,
    doctorId: number | string
  ): Promise<UploadResult> {
    try {
      // Validar
      const validation = await this.validateImage(buffer, ImageType.DOCTOR_SIGNATURE);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          errorType: validation.errorCode
        };
      }

      // Optimizar
      const optimized = await this.optimizeImage(buffer, ImageType.DOCTOR_SIGNATURE);

      // Generar nombre de archivo
      const fileName = this.generateFileName(ImageType.DOCTOR_SIGNATURE, doctorId);

      // Subir con reintentos
      const result = await R2StorageService.uploadFileWithRetry(
        optimized.buffer,
        fileName,
        'image/webp'
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          errorType: result.errorType
        };
      }

      const metadata = await sharp(optimized.buffer).metadata();

      return {
        success: true,
        url: result.url,
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        format: 'webp',
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0
        }
      };

    } catch (error) {
      console.error('Error subiendo firma de doctor:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        errorType: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Reemplaza una imagen existente de forma atómica
   * (elimina la vieja, sube la nueva)
   */
  static async replaceImage(
    oldUrl: string,
    newBuffer: Buffer,
    imageType: ImageType,
    entityId: number | string
  ): Promise<UploadResult> {
    try {
      // Subir la nueva imagen primero
      let uploadResult: UploadResult;

      switch (imageType) {
        case ImageType.PATIENT_PHOTO:
          uploadResult = await this.uploadPatientPhoto(newBuffer, entityId);
          break;
        case ImageType.PATIENT_SIGNATURE:
          uploadResult = await this.uploadPatientSignature(newBuffer, entityId);
          break;
        case ImageType.DOCTOR_SIGNATURE:
          uploadResult = await this.uploadDoctorSignature(newBuffer, entityId);
          break;
        default:
          return {
            success: false,
            error: 'Tipo de imagen no válido'
          };
      }

      // Si la subida falló, retornar error sin eliminar la vieja
      if (!uploadResult.success) {
        return uploadResult;
      }

      // Subida exitosa, ahora eliminar la imagen antigua
      const oldFileName = this.extractFileNameFromUrl(oldUrl);
      if (oldFileName) {
        try {
          await R2StorageService.deleteFile(oldFileName);
          console.log(`🗑️ Imagen antigua eliminada: ${oldFileName}`);

          // Si era una foto de paciente, también eliminar el thumbnail
          if (imageType === ImageType.PATIENT_PHOTO) {
            const thumbFileName = oldFileName.replace('.webp', '_thumb.webp');
            try {
              await R2StorageService.deleteFile(thumbFileName);
              console.log(`🗑️ Thumbnail antiguo eliminado: ${thumbFileName}`);
            } catch (error) {
              // No es crítico si el thumbnail no existe
              console.log(`ℹ️ No se pudo eliminar thumbnail antiguo (puede no existir): ${thumbFileName}`);
            }
          }
        } catch (error) {
          // Log el error pero no fallar la operación
          // La nueva imagen ya se subió correctamente
          console.error('⚠️ Error eliminando imagen antigua (nueva imagen subida correctamente):', error);
        }
      }

      return uploadResult;

    } catch (error) {
      console.error('Error reemplazando imagen:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        errorType: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Obtiene información de validación para un tipo de imagen
   */
  static getValidationConfig(imageType: ImageType) {
    return VALIDATION_CONFIG[imageType];
  }

  /**
   * Obtiene información de optimización para un tipo de imagen
   */
  static getOptimizationConfig(imageType: ImageType) {
    return OPTIMIZATION_CONFIG[imageType];
  }
}
