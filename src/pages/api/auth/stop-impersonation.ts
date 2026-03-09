import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // 1. Verificar si existe la sesión de admin guardada
    const adminToken = cookies.get('admin-session')?.value;
    
    if (!adminToken) {
      return new Response(JSON.stringify({ success: false, message: 'No hay sesión de administrador activa para restaurar' }), { status: 400 });
    }

    // 2. Verificar que el token guardado sea válido y sea admin
    const adminUser = verifyToken(adminToken);
    
    if (!adminUser || adminUser.role !== 'admin') {
      // Si el token expiró o no es válido, limpiar todo por seguridad
      cookies.delete('admin-session', { path: '/' });
      return new Response(JSON.stringify({ success: false, message: 'La sesión de administrador ha expirado. Por favor inicie sesión nuevamente.' }), { status: 401 });
    }

    // 3. Restaurar la sesión de admin
    cookies.set('auth-token', adminToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    // 4. Eliminar la cookie temporal
    cookies.delete('admin-session', { path: '/' });

    return new Response(JSON.stringify({
      success: true,
      message: 'Sesión de administrador restaurada',
      redirectUrl: '/admin/dashboard'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al detener impersonation:', error);
    return new Response(JSON.stringify({ success: false, message: 'Error interno del servidor' }), { status: 500 });
  }
};
