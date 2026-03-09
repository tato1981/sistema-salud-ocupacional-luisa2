// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar contraseña (mínimo 6 caracteres)
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

// Formatear respuestas API
export function apiResponse(success: boolean, message: string, data?: any) {
  return {
    success,
    message,
    data: data || null,
    timestamp: new Date().toISOString()
  };
}

export function getBaseUrl(): string {
  // 1. Prioridad a APP_BASE_URL configurada explícitamente
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL;
  }

  // 2. Detectar URLs comunes en plataformas de hosting
  // Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Netlify
  if (process.env.URL) {
    return process.env.URL;
  }

  // Railway, Render, Heroku
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL;
  }

  // 3. Detectar NODE_ENV para decidir entre producción y desarrollo
  if (process.env.NODE_ENV === 'production') {
    // En producción sin URL configurada, intentar construir desde HOST y PORT
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '4321';

    // Si el host no es localhost, asumir que es producción con HTTPS
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return `https://${host}`;
    }

    return `http://${host}:${port}`;
  }

  // 4. Fallback para desarrollo local
  return 'http://localhost:4321';
}