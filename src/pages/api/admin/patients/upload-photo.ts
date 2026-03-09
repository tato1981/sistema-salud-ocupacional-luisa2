import type { APIRoute } from 'astro';
import { ImageProcessingService } from '@/lib/image-processing-service';
import { R2StorageService } from '@/lib/r2-storage-service';

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

    // Validar que sea una imagen
    const allowedTypes = ['image/avif', 'image/webp', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(photoFile.type)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Formato de imagen no válido. Se permiten: AVIF, WebP, JPEG, PNG'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (photoFile.size > maxSize) {
      return new Response(JSON.stringify({
        success: false,
        message: 'La imagen es demasiado grande. Máximo 5MB'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const baseFileName = `patient_${patientId || timestamp}_${timestamp}`;
    
    // Convertir el archivo a buffer para procesamiento
    const bytes = await photoFile.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);

    console.log(`📸 Procesando imagen original de ${Math.round(originalBuffer.length / 1024)}KB`);

    // Procesar imagen con optimización (retorna buffer)
    const processingResult = await ImageProcessingService.processImageBuffer(
      originalBuffer, 
      'patient'
    );

    // Subir a R2
    const fileName = `patients/${baseFileName}.webp`;
    const publicUrl = await R2StorageService.uploadFile(
      processingResult.buffer,
      fileName,
      'image/webp'
    );

    // También crear versión pequeña para certificados y subirla
    const certResult = await ImageProcessingService.processImageBuffer(originalBuffer, 'certificate');
    const certFileName = `patients/${baseFileName}_cert.webp`;
    await R2StorageService.uploadFile(
      certResult.buffer,
      certFileName,
      'image/webp'
    );
    
    console.log('✅ Foto optimizada subida exitosamente a R2:', publicUrl);
    console.log(`📊 Reducción de tamaño: ${processingResult.originalSize} → ${processingResult.finalSize} bytes`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Foto subida exitosamente',
      data: {
        fileName: publicUrl, // Retornamos la URL completa
        path: publicUrl,
        size: photoFile.size,
        type: photoFile.type
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al subir foto:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor al subir la foto'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
