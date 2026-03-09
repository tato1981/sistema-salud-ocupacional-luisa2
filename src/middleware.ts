import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';

/**
 * Middleware de Astro
 *
 * NOTA: Sistema de imágenes 100% Cloudflare R2
 * ===============================================
 * Este sistema utiliza Cloudflare R2 para almacenamiento de imágenes.
 * No se sirven archivos desde el sistema de archivos local.
 * Todas las imágenes se acceden directamente desde URLs públicas de R2.
 */

export const onRequest = defineMiddleware(async (context, next) => {
  // Detectar dispositivos móviles y redirigir certificados
  const userAgent = context.request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile && context.url.pathname === '/certificates/verify') {
    const searchParams = context.url.search;
    return context.redirect(`/certificates/mobile${searchParams}`);
  }

  // Excluir rutas públicas del middleware
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/api/auth/login',
    '/api/auth/register',
    // Endpoints públicos de verificación de certificados
    '/api/certificates/verify',
    '/api/certificates/download',
    // Rutas de verificación
    '/certificates/verify',
    '/certificates/mobile'
  ];
  
  // Permitir rutas públicas exactamente o con query params
  const pathname = context.url.pathname;
  if (publicPaths.includes(pathname)) {
    return next();
  }

  // Verificar autenticación para rutas protegidas
  const isProtected = (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/doctor/') ||
    pathname.startsWith('/patient/') ||
    pathname.startsWith('/company/') ||
    (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/'))
  );
  
  if (isProtected) {
    const token = context.cookies.get('auth-token')?.value;
    if (!token) {
      return context.redirect('/auth/login');
    }

    const user = verifyToken(token);
    if (!user) {
      context.cookies.delete('auth-token');
      return context.redirect('/auth/login');
    }

    // Agregar usuario al contexto
    context.locals.user = user;
  }

  return next();
});