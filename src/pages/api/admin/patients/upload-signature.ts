import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/auth.js';
import path from 'path';
import { R2StorageService } from '@/lib/r2-storage-service';

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

    if (!signatureFile) {
      return new Response(JSON.stringify({ success: false, message: 'No se recibió archivo de firma' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar tipo de archivo
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(signatureFile.type)) {
      return new Response(JSON.stringify({ success: false, message: 'Tipo de archivo no válido. Solo PNG, JPG, JPEG y WebP son permitidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar tamaño de archivo (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (signatureFile.size > maxSize) {
      return new Response(JSON.stringify({ success: false, message: 'El archivo es demasiado grande. Máximo 2MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const ext = path.extname(signatureFile.name);
    const filename = `signature_${patientId}_${timestamp}${ext}`;
    
    // Guardar archivo
    const buffer = Buffer.from(await signatureFile.arrayBuffer());
    
    // Subir a R2
    const r2FileName = `signatures/${filename}`;
    const publicUrl = await R2StorageService.uploadFile(
      buffer,
      r2FileName,
      signatureFile.type
    );

    console.log('✅ Firma subida a R2:', publicUrl);

    return new Response(JSON.stringify({
      success: true,
      message: 'Firma subida exitosamente',
      data: {
        path: publicUrl,
        filename: publicUrl // Retornamos URL completa
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error subiendo firma:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error al subir firma'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
