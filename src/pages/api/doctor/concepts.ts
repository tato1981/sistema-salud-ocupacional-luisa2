import type { APIRoute } from 'astro';
import { db } from '../../../lib/database';
import { requireAuth } from '../../../lib/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const user = requireAuth(cookies);
    if (!user || user.role !== 'doctor') {
      return new Response(JSON.stringify({
        success: false,
        message: 'No autorizado'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const query = `
      SELECT 
        a.id,
        a.appointment_date,
        a.status,
        a.appointment_type,
        p.id as patient_id,
        p.name as patient_name,
        p.document_number as patient_document,
        COALESCE(c.name, p.company) as patient_company,
        u.name as doctor_name,
        wc.id as certificate_id,
        wc.aptitude_status,
        wc.verification_code
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      JOIN users u ON a.doctor_id = u.id
      LEFT JOIN (
          SELECT id, appointment_id, aptitude_status, verification_code
          FROM work_certificates
          WHERE id IN (
              SELECT MAX(id) FROM work_certificates GROUP BY appointment_id
          )
      ) wc ON a.id = wc.appointment_id
      WHERE a.doctor_id = ?
      AND (a.status = 'completada' OR wc.id IS NOT NULL)
      ORDER BY a.appointment_date DESC
    `;

    const [rows] = await db.execute(query, [user.id]);

    return new Response(JSON.stringify({
      success: true,
      data: rows
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en GET /api/doctor/concepts:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
