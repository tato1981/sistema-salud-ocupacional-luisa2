import type { APIRoute } from 'astro';
import { PatientService } from '@/lib/patient-service';
import { requireAuth } from '@/lib/auth';
import { MigrationService } from '@/lib/migration-service';
import { StorageService } from '@/lib/storage';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar autenticación
    const user = requireAuth(cookies);
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No autorizado'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener todos los pacientes
    const patients = await PatientService.getAllPatients();

    return new Response(JSON.stringify({
      success: true,
      data: patients
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en GET /api/admin/patients:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('🚀 POST /api/admin/patients - Iniciando...');
    
    // Ejecutar migraciones automáticamente
    try {
      await MigrationService.runMigrations();
    } catch (migrationError) {
      console.warn('⚠️ Error en migraciones (continuando):', migrationError);
    }
    
    // Debug de cookies
    const token = cookies.get('auth-token')?.value;
    console.log('🍪 Token presente:', !!token);
    if (token) {
      console.log('🍪 Token (primeros 20 chars):', token.substring(0, 20) + '...');
    }
    
    // Verificar autenticación
    const user = requireAuth(cookies);
    console.log('👤 Usuario autenticado:', user ? `${user.name} (${user.role})` : 'NO USER');
    
    if (!user || user.role !== 'admin') {
      console.log('❌ Acceso denegado - User:', user, 'Role:', user?.role);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No autorizado',
        debug: {
          hasUser: !!user,
          userRole: user?.role,
          isAdmin: user?.role === 'admin'
        }
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let body: any = {};
    let signatureFile: File | null = null;
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
      
      const signatureEntry = formData.get('signature');
      if (signatureEntry instanceof File && signatureEntry.size > 0) {
        signatureFile = signatureEntry;
      }
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Content-Type no soportado'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('📝 Datos recibidos:', JSON.stringify(body, null, 2));
    
    // Validar campos requeridos
    const requiredFields = ['name', 'documentType', 'documentNumber', 'dateOfBirth', 'gender'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`❌ Campo faltante: ${field}, valor:`, body[field]);
        return new Response(JSON.stringify({
          success: false,
          message: `El campo ${field} es requerido`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Procesar firma si existe
    if (signatureFile) {
      try {
        const arrayBuffer = await signatureFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = `signatures/patients/${body.documentNumber}_${Date.now()}.png`;
        const url = await StorageService.uploadFile(buffer, filename, 'image/png');
        body.signaturePath = url;
      } catch (uploadError) {
        console.error('Error uploading signature:', uploadError);
      }
    }

    // Validar fecha de nacimiento - no puede ser mayor a la fecha actual
    const birthDateStr = body.dateOfBirth;
    // Asegurar que sea una fecha en formato YYYY-MM-DD
    let formattedBirthDate = birthDateStr;
    
    if (birthDateStr.includes('T')) {
      // Si viene en formato ISO, extraer solo la fecha
      formattedBirthDate = birthDateStr.split('T')[0];
    }
    
    const birthDate = new Date(formattedBirthDate + 'T00:00:00.000Z');
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999); // Final del día actual
    
    if (birthDate > currentDate) {
      console.log('❌ Fecha de nacimiento inválida:', formattedBirthDate, 'es mayor a:', currentDate.toISOString().split('T')[0]);
      return new Response(JSON.stringify({
        success: false,
        message: 'La fecha de nacimiento no puede ser mayor a la fecha actual'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear el paciente
    const patientData = {
      name: body.name,
      email: body.email || undefined,
      phone: body.phone || undefined,
      documentType: body.documentType,
      documentNumber: body.documentNumber, // Ya está correcto
      dateOfBirth: formattedBirthDate, // Usar la fecha formateada
      gender: body.gender,
      bloodType: body.bloodType || undefined,
      address: body.address || undefined,
      occupation: body.occupation || undefined,
      company: body.company || undefined,
      companyId: body.companyId === '' ? null : (body.companyId ? parseInt(body.companyId) : undefined),
      emergencyContactName: body.emergencyContactName || undefined,
      emergencyContactPhone: body.emergencyContactPhone || undefined,
      photoPath: body.photoPath || undefined,
      signaturePath: body.signaturePath || undefined,
      allergies: body.allergies || undefined,
      medications: body.medications || undefined,
      medicalConditions: body.medicalConditions || undefined,
      createdBy: user.id
    };

    console.log('🏥 Datos preparados para PatientService:', JSON.stringify(patientData, null, 2));
    console.log('📸 PhotoPath en patientData:', patientData.photoPath, 'Definido:', !!patientData.photoPath);

    const result = await PatientService.createPatient(patientData);
    
    console.log('📊 Resultado de PatientService.createPatient:', result);

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        data: result.patient,
        message: result.message
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: result.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error: any) {
    console.error('Error en POST /api/admin/patients:', error);
    
    // Manejar errores específicos
    if (error.message?.includes('UNIQUE constraint failed') || 
        error.message?.includes('Duplicate entry')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ya existe un paciente con este número de documento'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'Error al crear el paciente'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};