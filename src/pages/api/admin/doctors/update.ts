import type { APIRoute } from 'astro';
import { db } from '../../../../lib/database';
import { requireAuth } from '../../../../lib/auth';
import { hashPassword } from '../../../../lib/auth';
import { MigrationService } from '../../../../lib/migration-service';
import { ImageUploadService, ImageType } from '../../../../lib/image-upload-service';
import { R2StorageService } from '../../../../lib/r2-storage-service';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = requireAuth(cookies);
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Asegurar que la base de datos esté actualizada
    await MigrationService.runMigrations();

    // Cambiar a FormData para soportar archivos
    const formData = await request.formData();

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const document_number = formData.get('document_number') as string;
    const phone = formData.get('phone') as string;
    const specialization = formData.get('specialization') as string;
    const professional_license = formData.get('professional_license') as string;
    const password = formData.get('password') as string;
    const is_active = formData.get('is_active') === '1';
    const signatureFile = formData.get('signature') as File | null;
    const existingSignaturePath = formData.get('existing_signature_path') as string;
    const removeSignature = formData.get('remove_signature') === '1';

    // Validaciones
    if (!id || !name || !email || !document_number) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID, nombre, email y documento son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el doctor existe
    const [existingDoctor] = await db.execute(
      'SELECT id FROM users WHERE id = ? AND role = "doctor"',
      [id]
    );

    if ((existingDoctor as any[]).length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Doctor no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el email ya existe (excepto el doctor actual)
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );

    if ((existingUser as any[]).length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ya existe otro usuario con este email'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el documento ya existe (excepto el doctor actual)
    const [existingDoc] = await db.execute(
      'SELECT id FROM users WHERE document_number = ? AND id != ?',
      [document_number, id]
    );

    if ((existingDoc as any[]).length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ya existe otro usuario con este número de documento'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Procesar firma
    let signaturePath: string | null = existingSignaturePath || null;

    // Si se solicita eliminar la firma
    if (removeSignature) {
      if (existingSignaturePath && existingSignaturePath.startsWith('http')) {
        try {
          // Eliminar de R2
          const urlObj = new URL(existingSignaturePath);
          const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
          await R2StorageService.deleteFile(key);
          console.log('🗑️ Firma eliminada de R2');
        } catch (error) {
          console.error('⚠️ Error eliminando firma:', error);
        }
      }
      signaturePath = null;
    }
    // Si se subió una nueva firma
    else if (signatureFile && signatureFile.size > 0) {
      console.log('📝 Procesando nueva firma del médico...');

      try {
        // Convertir File a Buffer
        const arrayBuffer = await signatureFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let result;

        // Si existe una firma anterior, usar reemplazo atómico
        if (existingSignaturePath && existingSignaturePath.startsWith('http')) {
          console.log('🔄 Reemplazando firma anterior...');
          result = await ImageUploadService.replaceImage(
            existingSignaturePath,
            buffer,
            ImageType.DOCTOR_SIGNATURE,
            id
          );
        } else {
          // No hay firma anterior, subir nueva
          console.log('☁️ Subiendo nueva firma...');
          result = await ImageUploadService.uploadDoctorSignature(buffer, id);
        }

        if (!result.success) {
          console.error(`❌ Error subiendo firma: ${result.error}`);
          return new Response(JSON.stringify({
            success: false,
            message: result.error || 'Error al subir la firma',
            errorType: result.errorType
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        signaturePath = result.url;
        console.log('✅ Firma procesada exitosamente:', signaturePath);
      } catch (error) {
        console.error('❌ Error procesando firma:', error);
        return new Response(JSON.stringify({
          success: false,
          message: 'Error al procesar la firma'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Preparar la actualización
    let updateQuery = `
      UPDATE users SET
        name = ?,
        email = ?,
        document_number = ?,
        phone = ?,
        specialization = ?,
        professional_license = ?,
        is_active = ?,
        signature_path = ?
    `;
    let updateParams = [
      name,
      email,
      document_number,
      phone || null,
      specialization || 'Medicina General',
      professional_license || null,
      is_active ? 1 : 0,
      signaturePath
    ];

    // Si se proporcionó una nueva contraseña, incluirla en la actualización
    if (password && password.trim() !== '') {
      const passwordHash = await hashPassword(password);
      updateQuery += ', password_hash = ?';
      updateParams.push(passwordHash);
    }

    updateQuery += ' WHERE id = ? AND role = "doctor"';
    updateParams.push(id);

    // Ejecutar la actualización
    await db.execute(updateQuery, updateParams);

    return new Response(JSON.stringify({
      success: true,
      message: 'Doctor actualizado correctamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error actualizando doctor:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};