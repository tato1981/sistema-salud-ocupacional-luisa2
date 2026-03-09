import type { APIRoute } from 'astro';
import { db } from '../../../lib/database';
import { generateToken, verifyToken } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Verificar que quien solicita es admin
    const adminToken = cookies.get('auth-token')?.value;
    
    if (!adminToken) {
      return new Response(JSON.stringify({ success: false, message: 'No autorizado' }), { status: 401 });
    }

    const adminUser = verifyToken(adminToken);
    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, message: 'Acceso denegado. Se requiere rol de administrador.' }), { status: 403 });
    }

    // 2. Obtener ID del usuario a suplantar
    const data = await request.json();
    const { userId } = data;

    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'ID de usuario requerido' }), { status: 400 });
    }

    // 3. Buscar usuario objetivo
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Usuario no encontrado' }), { status: 404 });
    }

    const targetUser = users[0] as any;

    // 4. Generar token para el usuario objetivo
    const targetToken = generateToken({
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      company_id: targetUser.company_id
    });

    // 5. Guardar token de admin original en cookie segura (si no existe ya)
    // Si ya estamos suplantando, mantenemos el original
    const existingAdminSession = cookies.get('admin-session')?.value;
    if (!existingAdminSession) {
        cookies.set('admin-session', adminToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 1 día
        });
    }

    // 6. Establecer nuevo token de sesión
    cookies.set('auth-token', targetToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Sesión iniciada como ${targetUser.name}`,
      redirectUrl: '/dashboard'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en impersonation:', error);
    return new Response(JSON.stringify({ success: false, message: 'Error interno del servidor' }), { status: 500 });
  }
};
