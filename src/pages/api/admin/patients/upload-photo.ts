import type { APIRoute } from 'astro';
import { ImageUploadService } from '@/lib/image-upload-service';
import { R2ErrorType } from '@/lib/r2-storage-service';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📸 API upload-photo - Iniciando...');
    const formData = await request.formData();
    const photoFile = formData.get('photo') as File;
    const patientId = formData.get('patientId') as string;

    console.log('📸 Datos recibidos:', {
      photoFile: !!photoFile,
      fileName: photoFile?.name,
      fileSize: photoFile?.size,
      fileType: photoFile?.type,
      patientId: patientId
    });

    // Validación básica
    if (!photoFile || photoFile.size === 0) {
      console.log('❌ No se proporcionó foto válida');
      return new Response(JSON.stringify({
        success: false,
        message: 'No se proporcionó ninguna foto'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!patientId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID de paciente requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convertir archivo a buffer
    const bytes = await photoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`📸 Procesando imagen de ${Math.round(buffer.length / 1024)}KB`);

    // Usar ImageUploadService que maneja validación, optimización y subida con reintentos
    const result = await ImageUploadService.uploadPatientPhoto(buffer, patientId);

    if (!result.success) {
      // Determinar código de estado HTTP según el tipo de error
      let statusCode = 500;

      if (result.errorType === 'INVALID_FORMAT' ||
          result.errorType === 'FILE_TOO_LARGE' ||
          result.errorType === 'INVALID_DIMENSIONS' ||
          result.errorType === 'INVALID_CONTENT_TYPE') {
        statusCode = 400; // Bad Request
      } else if (result.errorType === R2ErrorType.AUTH_ERROR) {
        statusCode = 500; // Internal Server Error (problema de config)
      } else if (result.errorType === R2ErrorType.NETWORK_ERROR ||
                 result.errorType === R2ErrorType.TIMEOUT_ERROR ||
                 result.errorType === R2ErrorType.R2_TEMPORARILY_UNAVAILABLE) {
        statusCode = 503; // Service Unavailable
      } else if (result.errorType === R2ErrorType.STORAGE_FULL) {
        statusCode = 507; // Insufficient Storage
      }

      console.error(`❌ Error subiendo foto: ${result.error} (tipo: ${result.errorType})`);

      return new Response(JSON.stringify({
        success: false,
        message: result.error || 'Error subiendo foto',
        errorType: result.errorType
      }), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Éxito
    console.log('✅ Foto subida exitosamente a R2:', result.url);
    console.log(`📊 Reducción de tamaño: ${result.originalSize} → ${result.optimizedSize} bytes (${Math.round((1 - (result.optimizedSize! / result.originalSize!)) * 100)}% reducción)`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Foto subida exitosamente',
      data: {
        fileName: result.url, // URL completa de R2
        path: result.url,
        thumbnailUrl: result.thumbnailUrl, // URL del thumbnail para certificados
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        format: result.format,
        dimensions: result.dimensions,
        reduction: Math.round((1 - (result.optimizedSize! / result.originalSize!)) * 100)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error interno al subir foto:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor al subir la foto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
