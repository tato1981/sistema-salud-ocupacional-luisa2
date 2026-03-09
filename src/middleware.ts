import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';
import fs from 'fs';
import path from 'path';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  // Servir archivos estáticos de uploads/ (carpeta persistente fuera de dist/)
  if (url.pathname.startsWith('/uploads/')) {
    // Decodificar la URL para manejar espacios y caracteres especiales
    const decodedPath = decodeURIComponent(url.pathname);
    
    // Intentar múltiples ubicaciones en orden de prioridad
    // Esto cubre: entorno local, producción (node adapter), y posibles variaciones de CWD
    const possiblePaths = [
      path.join(process.cwd(), decodedPath),                           // Opción 1: uploads/ en raíz (CWD correcto)
      path.join(process.cwd(), 'public', decodedPath),                 // Opción 2: public/uploads/ (Desarrollo)
      path.join(process.cwd(), 'dist', 'client', decodedPath),         // Opción 3: dist/client/uploads/ (Build estático)
      path.resolve(process.cwd(), '..', decodedPath.replace(/^\//, '')), // Opción 4: Un nivel arriba (si CWD está en dist/)
      path.join(process.cwd(), '..', 'public', decodedPath)            // Opción 5: Un nivel arriba en public (raro pero posible)
    ];

    let filePath: string | null = null;

    // Buscar el archivo en las ubicaciones posibles
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        // Verificar que sea un archivo y no un directorio
        const stat = fs.statSync(possiblePath);
        if (stat.isFile()) {
          filePath = possiblePath;
          break;
        }
      }
    }

    if (filePath) {
      try {
        const file = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();

        // Determinar content-type
        const contentTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.avif': 'image/avif',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.pdf': 'application/pdf'
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';

        return new Response(file, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Served-By': 'Astro-Middleware' // Header debug para confirmar que pasa por aquí
          }
        });
      } catch (err) {
        console.error(`❌ Error al leer archivo ${filePath}:`, err);
        return new Response('Error reading file', { status: 500 });
      }
    } else {
      console.warn(`❌ Archivo no encontrado (404): ${decodedPath}`);
      console.warn(`   CWD: ${process.cwd()}`);
      console.warn(`   Rutas verificadas:`, possiblePaths);
      return new Response('File not found', { status: 404 });
    }
  }

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