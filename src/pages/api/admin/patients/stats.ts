import type { APIRoute } from 'astro';
import { PatientService } from '@/lib/patient-service';
import { requireAuth } from '@/lib/auth';

export const GET: APIRoute = async ({ cookies }) => {
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

    // Obtener estadísticas de pacientes
    const stats = await PatientService.getPatientStats();

    return new Response(JSON.stringify({
      success: true,
      data: stats
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en GET /api/admin/patients/stats:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};