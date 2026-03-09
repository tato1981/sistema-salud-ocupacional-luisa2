import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { db } from '../../../lib/database';

export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    // Verificar autenticación
    const user = requireAuth(cookies);
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No autorizado' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let doctorId;
    
    // Si es admin, puede ver todas las citas, si es doctor solo las suyas
    if (user.role === 'admin') {
      // Para admin, podemos recibir un parámetro de doctor específico
      const selectedDoctorId = url.searchParams.get('doctorId');
      doctorId = selectedDoctorId ? parseInt(selectedDoctorId) : null;
    } else if (user.role === 'doctor') {
      doctorId = user.id;
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Sin permisos para ver citas'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Paginación y búsqueda
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const date = url.searchParams.get('date') || '';
    const offset = (page - 1) * limit;

    // Construir WHERE clause
    let whereClause = ' WHERE 1=1';
    const params: any[] = [];

    if (doctorId) {
      whereClause += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }

    if (search) {
      whereClause += ' AND (p.document_number LIKE ? OR p.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      // Asumiendo que date viene en formato YYYY-MM-DD y appointment_date es DATETIME
      whereClause += ' AND DATE(a.appointment_date) = ?';
      params.push(date);
    }

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON a.doctor_id = u.id
      ${whereClause}
    `;

    const [countResult] = await db.execute(countQuery, params);
    const total = (countResult as any)[0].total;

    // Query principal
    const query = `
      SELECT a.*, 
             p.name as patient_name,
             p.document_number as patient_document,
             p.phone as patient_phone,
             COALESCE(c.name, p.company) as patient_company,
             p.photo_path as patient_photo_path,
             u.name as doctor_name,
             (SELECT id FROM work_certificates WHERE appointment_id = a.id ORDER BY id DESC LIMIT 1) as certificate_id,
             (SELECT verification_code FROM work_certificates WHERE appointment_id = a.id ORDER BY id DESC LIMIT 1) as verification_code
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON a.doctor_id = u.id
      ${whereClause}
      ORDER BY a.appointment_date DESC
      LIMIT ? OFFSET ?
    `;

    // Añadir parámetros de paginación
    const queryParams = [...params, limit.toString(), offset.toString()];

    const [rows] = await db.execute(query, queryParams);

    // Obtener estadísticas globales
    const statsQuery = `
      SELECT 
        COUNT(CASE WHEN DATE(appointment_date) = CURDATE() THEN 1 END) as today_count,
        COUNT(CASE WHEN status = 'completada' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'programada' AND appointment_date >= NOW() THEN 1 END) as pending_count,
        COUNT(DISTINCT patient_id) as total_patients
      FROM appointments
      WHERE 1=1 ${doctorId ? 'AND doctor_id = ?' : ''}
    `;
    
    const statsParams = doctorId ? [doctorId] : [];
    const [statsResult] = await db.execute(statsQuery, statsParams);
    const stats = (statsResult as any)[0];

    return new Response(JSON.stringify({
      success: true,
      data: rows,
      stats: {
        today: stats.today_count,
        completed: stats.completed_count,
        pending: stats.pending_count,
        patients: stats.total_patients
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en GET /api/doctor/appointments:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};