import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/auth.js';
import { ImageUploadService } from '@/lib/image-upload-service';
import { R2ErrorType } from '@/lib/r2-storage-service';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = requireAuth(cookies);
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, message: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const signatureFile = formData.get('signature') as File;
    const patientId = formData.get('patientId') as string;

    console.log('✍️ API upload-signature - Datos recibidos:', {
      signatureFile: !!signatureFile,
      fileName: signatureFile?.name,
      fileSize: signatureFile?.size,
      fileType: signatureFile?.type,
      patientId: patientId
    });

    // Validación básica
    if (!signatureFile || signatureFile.size === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No se recibió archivo de firma'
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
    const buffer = Buffer.from(await signatureFile.arrayBuffer());

    console.log(`✍️ Procesando firma de ${Math.round(buffer.length / 1024)}KB`);

    // Usar ImageUploadService que maneja validación, optimización y subida con reintentos
    const result = await ImageUploadService.uploadPatientSignature(buffer, patientId);

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

      console.error(`❌ Error subiendo firma: ${result.error} (tipo: ${result.errorType})`);

      return new Response(JSON.stringify({
        success: false,
        message: result.error || 'Error subiendo firma',
        errorType: result.errorType
      }), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Éxito
    console.log('✅ Firma subida exitosamente a R2:', result.url);
    console.log(`📊 Reducción de tamaño: ${result.originalSize} → ${result.optimizedSize} bytes (${Math.round((1 - (result.optimizedSize! / result.originalSize!)) * 100)}% reducción)`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Firma subida exitosamente',
      data: {
        path: result.url,
        filename: result.url, // URL completa de R2
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
  } catch (error: any) {
    console.error('Error interno subiendo firma:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno al subir firma',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
