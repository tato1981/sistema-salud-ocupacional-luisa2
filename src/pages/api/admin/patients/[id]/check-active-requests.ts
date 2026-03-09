import type { APIRoute } from 'astro';
import { db } from '../../../../../lib/database';
import { requireAuth } from '../../../../../lib/auth';

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

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID de paciente requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener el documento del paciente
    const [patientRows] = await db.execute(
      'SELECT document_number FROM patients WHERE id = ?',
      [id]
    );

    const patients = patientRows as any[];
    if (patients.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Paciente no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const documentNumber = patients[0].document_number;

    // Verificar si existe una solicitud activa (pending o scheduled)
    const [requestRows] = await db.execute(
      `SELECT
        er.id,
        er.status,
        er.exam_type,
        er.created_at,
        er.appointment_id,
        c.name as company_name
       FROM exam_requests er
       LEFT JOIN companies c ON er.company_id = c.id
       WHERE er.patient_document = ?
       AND er.status IN ('pending', 'scheduled')
       ORDER BY er.created_at DESC
       LIMIT 1`,
      [documentNumber]
    );

    const requests = requestRows as any[];
    const hasActiveRequest = requests.length > 0;

    return new Response(JSON.stringify({
      success: true,
      data: {
        hasActiveRequest,
        request: hasActiveRequest ? requests[0] : null
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al verificar solicitudes activas:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error al verificar solicitudes activas'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
