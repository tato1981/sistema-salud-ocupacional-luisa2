import type { APIRoute } from 'astro';
import { PatientService } from '@/lib/patient-service';
import { requireAuth } from '@/lib/auth';
import { StorageService } from '@/lib/storage';

// GET - Obtener un paciente específico
export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    // Verificar autenticación
    const user = requireAuth(cookies);
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No autorizado' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const patientId = params.id;
    if (!patientId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID de paciente requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const patient = await PatientService.getPatientById(parseInt(patientId));

    if (!patient) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Paciente no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: patient
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en GET /api/admin/patients/[id]:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT - Actualizar un paciente
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    // Verificar autenticación
    const user = requireAuth(cookies);
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No autorizado' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const patientId = params.id;
    if (!patientId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID de paciente requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let body: any = {};
    let signatureFile: File | null = null;
    let photoFile: File | null = null;
    let deletePhoto = false;
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
      if (body.deletePhoto) deletePhoto = true;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
      
      const signatureEntry = formData.get('signature');
      if (signatureEntry instanceof File && signatureEntry.size > 0) {
        signatureFile = signatureEntry;
      }

      const photoEntry = formData.get('photo');
      if (photoEntry instanceof File && photoEntry.size > 0) {
        photoFile = photoEntry;
      }

      if (formData.get('deletePhoto') === 'true') {
        deletePhoto = true;
      }
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Content-Type no soportado'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validar campos requeridos
    const requiredFields = ['name', 'documentType', 'documentNumber', 'dateOfBirth', 'gender'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(JSON.stringify({
          success: false,
          message: `El campo ${field} es requerido`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Obtener paciente actual para manejar eliminación de archivos
    const currentPatient = await PatientService.getPatientById(parseInt(patientId));
    
    // Helper para extraer key de la URL
    const getKeyFromUrl = (url: string) => {
      if (!url) return null;
      try {
        if (url.startsWith('/uploads/')) {
          return url.replace('/uploads/', '');
        }
        // Para R2/S3, intentamos extraer la parte después del dominio
        const urlObj = new URL(url);
        // Si es una URL completa, el pathname sin el primer slash es el key
        // Pero hay que tener cuidado con el bucket name si está en el path
        // Asumimos que el StorageService devuelve URLs donde el pathname (menos el bucket si aplica) es el key
        // Simplificación: si contiene 'photos/' o 'signatures/', cortamos desde ahí
        if (url.includes('photos/')) return url.substring(url.indexOf('photos/'));
        if (url.includes('signatures/')) return url.substring(url.indexOf('signatures/'));
        return urlObj.pathname.substring(1);
      } catch (e) {
        // Si no es una URL válida, devolvemos el string original (puede ser path relativo)
        return url;
      }
    };

    // Procesar firma si existe
    if (signatureFile) {
      try {
        // Eliminar firma anterior si existe
        if (currentPatient?.signature_path) {
          const oldKey = getKeyFromUrl(currentPatient.signature_path);
          if (oldKey) await StorageService.deleteFile(oldKey);
        }

        const arrayBuffer = await signatureFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = `signatures/patients/${body.documentNumber}_${Date.now()}.png`;
        const url = await StorageService.uploadFile(buffer, filename, 'image/png');
        body.signaturePath = url;
      } catch (uploadError) {
        console.error('Error uploading signature:', uploadError);
      }
    }

    // Procesar foto de perfil si existe o si se solicitó eliminar
    if (photoFile || deletePhoto) {
      // Eliminar foto anterior si existe
      if (currentPatient?.photo_path) {
        const oldKey = getKeyFromUrl(currentPatient.photo_path);
        if (oldKey) await StorageService.deleteFile(oldKey);
      }
    }

    if (photoFile) {
      try {
        const arrayBuffer = await photoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt = photoFile.name.split('.').pop() || 'jpg';
        const filename = `photos/patients/${body.documentNumber}_${Date.now()}.${fileExt}`;
        const url = await StorageService.uploadFile(buffer, filename, photoFile.type || 'image/jpeg');
        body.photoPath = url;
      } catch (uploadError) {
        console.error('Error uploading photo:', uploadError);
      }
    }

    // Validar fecha de nacimiento - no puede ser mayor a la fecha actual
    const birthDateStr = body.dateOfBirth;
    let formattedBirthDate = birthDateStr;
    
    if (birthDateStr.includes('T')) {
      formattedBirthDate = birthDateStr.split('T')[0];
    }
    
    const birthDate = new Date(formattedBirthDate + 'T00:00:00.000Z');
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);
    
    if (birthDate > currentDate) {
      return new Response(JSON.stringify({
        success: false,
        message: 'La fecha de nacimiento no puede ser mayor a la fecha actual'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Preparar datos para actualización
    const patientData = {
      name: body.name,
      email: body.email || undefined,
      phone: body.phone || undefined,
      documentType: body.documentType,
      documentNumber: body.documentNumber,
      dateOfBirth: formattedBirthDate,
      gender: body.gender,
      bloodType: body.bloodType || undefined,
      address: body.address || undefined,
      occupation: body.occupation || undefined,
      company: body.company || undefined,
      companyId: body.companyId === '' ? null : (body.companyId ? parseInt(body.companyId) : undefined),
      emergencyContactName: body.emergencyContactName || undefined,
      emergencyContactPhone: body.emergencyContactPhone || undefined,
      photoPath: deletePhoto ? null : (body.photoPath || undefined),
      signaturePath: body.signaturePath || undefined,
      allergies: body.allergies || undefined,
      medications: body.medications || undefined,
      medicalConditions: body.medicalConditions || undefined,
      updatedBy: user.id
    };

    const result = await PatientService.updatePatientAdmin(parseInt(patientId), patientData);

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        data: result.patient,
        message: 'Paciente actualizado exitosamente'
      }), {
        status: 200,
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
    console.error('Error en PUT /api/admin/patients/[id]:', error);
    
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
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE - Eliminar un paciente
export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    // Verificar autenticación
    const user = requireAuth(cookies);
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No autorizado' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const patientId = params.id;
    if (!patientId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID de paciente requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener paciente para eliminar archivos
    const patient = await PatientService.getPatientById(parseInt(patientId));
    
    // Intentar eliminar paciente
    const result = await PatientService.deletePatientAdmin(parseInt(patientId));

    if (result.success) {
      // Si se eliminó correctamente, limpiar archivos de R2
      if (patient) {
        const getKeyFromUrl = (url: string) => {
          if (!url) return null;
          try {
            if (url.startsWith('/uploads/')) {
              return url.replace('/uploads/', '');
            }
            const urlObj = new URL(url);
            if (url.includes('photos/')) return url.substring(url.indexOf('photos/'));
            if (url.includes('signatures/')) return url.substring(url.indexOf('signatures/'));
            return urlObj.pathname.substring(1);
          } catch (e) {
            return url;
          }
        };

        if (patient.photo_path) {
          const key = getKeyFromUrl(patient.photo_path);
          if (key) await StorageService.deleteFile(key).catch(e => console.error('Error deleting photo:', e));
        }

        if (patient.signature_path) {
          const key = getKeyFromUrl(patient.signature_path);
          if (key) await StorageService.deleteFile(key).catch(e => console.error('Error deleting signature:', e));
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Paciente eliminado exitosamente'
      }), {
        status: 200,
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

  } catch (error) {
    console.error('Error en DELETE /api/admin/patients/[id]:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};