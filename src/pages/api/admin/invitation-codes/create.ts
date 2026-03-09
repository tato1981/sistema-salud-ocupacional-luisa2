import type { APIRoute } from 'astro';
import { db } from '../../../../lib/database';
import { requireAuth } from '../../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('🎫 API: Creando código de invitación...');
    const user = requireAuth(cookies);
    if (!user || user.role !== 'admin') {
      console.log('❌ Usuario no autorizado:', user);
      return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    console.log('📝 Datos recibidos:', body);
    const { code, email, max_uses, expires_at, description, assigned_role } = body;

    // Validaciones
    if (!code) {
      return new Response(JSON.stringify({
        success: false,
        message: 'El código es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el código ya existe
    const [existingCode] = await db.execute(
      'SELECT id FROM invitation_codes WHERE code = ?',
      [code]
    );

    if ((existingCode as any[]).length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ya existe un código con ese nombre'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insertar nuevo código de invitación
    const [result] = await db.execute(
      `INSERT INTO invitation_codes (
        code, email, max_uses, expires_at, description, created_by, is_active, assigned_role
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        code,
        email || null,
        parseInt(max_uses) || 1,
        expires_at || null,
        description || null,
        user.id,
        assigned_role || 'staff'
      ]
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Código de invitación creado correctamente',
      data: { id: (result as any).insertId }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error creando código de invitación:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};