# Manual de Solución de Errores (Troubleshooting)

Este documento detalla los problemas comunes que pueden surgir en el Sistema de Salud Ocupacional y cómo resolverlos.

## 1. Errores de Imágenes (Error 404 en Producción)

**Síntoma:** Las imágenes de perfil o firmas no cargan y muestran un error 404 en la consola, especialmente en producción.

**Causa:**
En entornos de producción (Node.js standalone), la ruta donde se guardan los archivos (`uploads/`) puede no coincidir con la ruta donde el servidor espera encontrarlos, debido a diferencias en el directorio de trabajo actual (`CWD`).

**Solución:**
El sistema cuenta con un middleware inteligente (`src/middleware.ts`) que busca los archivos en múltiples ubicaciones. Si el error persiste:

1. **Verificar Persistencia:** Asegúrese de que la carpeta `uploads/` no se esté borrando en cada despliegue. Si usa Docker, monte un volumen.
2. **Ubicación Manual:** Verifique manualmente dónde se están guardando los archivos en el servidor.
   - Ruta esperada: `./uploads/` (en la raíz del proyecto).
   - Ruta alternativa: `./dist/client/uploads/`.
3. **Logs:** Revise los logs del servidor. El middleware imprime advertencias detalladas cuando no encuentra un archivo:
   ```
   ❌ Archivo no encontrado (404): /uploads/patients/foto.webp
   CWD: /app
   Rutas verificadas: [...]
   ```

## 2. Errores de Conexión a Base de Datos

**Síntoma:** El sistema muestra "Error de conexión" o "ECONNREFUSED".

**Solución:**
1. Verifique que MySQL esté ejecutándose.
2. Revise el archivo `.env` y confirme que `DB_HOST`, `DB_USER` y `DB_PASSWORD` son correctos.
3. **Prueba de Conexión:** Intente conectarse manualmente a la base de datos usando un cliente como DBeaver.

## 3. Errores al Subir Imágenes

**Síntoma:** "Error al subir imagen", "Permission denied" o la imagen no aparece.

**Solución:**
1. **Permisos:** Asegúrese de que el usuario que ejecuta la aplicación Node.js tenga permisos de escritura en la carpeta `uploads/`.
   ```bash
   chmod -R 755 uploads/
   ```
2. **Sharp:** Verifique que la librería `sharp` esté instalada correctamente. A veces requiere reinstalación si se cambia de SO (ej. de Windows a Linux).
   ```bash
   npm install --force sharp
   ```

## 4. Problemas con el Envío de Correos

**Síntoma:** No llegan los correos de recuperación de contraseña o invitaciones.

**Solución:**
1. Verifique las credenciales SMTP en `.env`.
2. Ejecute el script de diagnóstico incluido:
   ```bash
   node scripts/verify-hostinger-smtp.cjs
   ```
   Este script probará la conexión SMTP y enviará un correo de prueba, mostrando logs detallados del proceso.

## 5. Problemas de Sesión / Login

**Síntoma:** "Redirección constante al login" o "No se puede iniciar sesión".

**Solución:**
1. **Cookies:** Limpie las cookies del navegador.
2. **Hora del Servidor:** Verifique que la hora del servidor sea correcta, ya que los tokens JWT dependen de la hora del sistema para su validación de expiración.

## 6. Errores de Compilación (Build)

**Síntoma:** `npm run build` falla.

**Solución:**
1. Ejecute `npx astro check` para identificar problemas de tipos en los archivos `.astro` y `.ts`.
2. Limpie caché y reinstale dependencias:
   ```bash
   rm -rf node_modules dist .astro
   npm install
   ```

---

**Soporte Técnico**
Si el problema persiste, capture los logs de error de la terminal y contacte al equipo de desarrollo.
