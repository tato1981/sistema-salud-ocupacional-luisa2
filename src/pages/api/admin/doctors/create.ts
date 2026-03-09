import type { APIRoute } from 'astro';
import { db } from '../../../../lib/database';
import { requireAuth } from '../../../../lib/auth';
import { hashPassword } from '../../../../lib/auth';
import { MigrationService } from '../../../../lib/migration-service';
import { ImageUploadService } from '../../../../lib/image-upload-service';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('👨‍⚕️ API: Creando doctor...');
    const user = requireAuth(cookies);
    if (!user || user.role !== 'admin') {
      console.log('❌ Usuario no autorizado:', user);
      return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Asegurar que la base de datos esté actualizada
    await MigrationService.runMigrations();

    // Cambiar a FormData para soportar archivos
    const formData = await request.formData();
    console.log('📝 Datos del doctor recibidos');

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const document_number = formData.get('document_number') as string;
    const phone = formData.get('phone') as string;
    const specialization = formData.get('specialization') as string;
    const professional_license = formData.get('professional_license') as string;
    const password = formData.get('password') as string;
    const is_active = formData.get('is_active') === '1';
    const signatureFile = formData.get('signature') as File | null;

    // Validaciones
    if (!name || !email || !document_number || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Nombre, email, documento y contraseña son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el email ya existe
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUser as any[]).length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ya existe un usuario con este email'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el documento ya existe
    const [existingDoc] = await db.execute(
      'SELECT id FROM users WHERE document_number = ?',
      [document_number]
    );

    if ((existingDoc as any[]).length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ya existe un usuario con este número de documento'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password);

    // Procesar firma si se subió
    let signaturePath: string | null = null;
    if (signatureFile && signatureFile.size > 0) {
      console.log('📝 Procesando firma del médico...');

      try {
        // Convertir File a Buffer
        const arrayBuffer = await signatureFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Usar ImageUploadService para validación, optimización y subida con reintentos
        // Usamos document_number como ID temporal, se actualizará después con el ID real si es necesario
        const result = await ImageUploadService.uploadDoctorSignature(buffer, document_number);

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
        console.log('✅ Firma guardada en R2:', signaturePath);
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

    // Insertar nuevo doctor
    const [result] = await db.execute(
      `INSERT INTO users (
        name, email, password_hash, document_number, phone,
        specialization, professional_license, role, is_active, signature_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'doctor', ?, ?)`,
      [
        name,
        email,
        passwordHash,
        document_number,
        phone || null,
        specialization || 'Medicina General',
        professional_license || null,
        is_active ? 1 : 0,
        signaturePath
      ]
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Doctor creado correctamente',
      data: { id: (result as any).insertId }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error creando doctor:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};