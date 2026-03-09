# Sistema de Salud Ocupacional

Sistema completo de gestión de salud ocupacional con generación de certificados médicos, historias clínicas y gestión de pacientes.

## 🚀 Características

- Gestión de pacientes y doctores
- Creación de historias médicas ocupacionales
- Generación de certificados de aptitud laboral con firma digital
- Códigos QR para verificación de certificados
- Envío automático de certificados por correo electrónico
- Sistema de citas médicas
- Panel de administración

## 📋 Requisitos

- Node.js 18+
- MySQL 8+
- SMTP para envío de correos (opcional)

## 🛠️ Instalación

1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd occupational-health-system
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
- Configuración de base de datos (MySQL)
- JWT_SECRET para autenticación
- **APP_BASE_URL**: URL base de tu aplicación (ver sección de producción)
- Configuración SMTP para correos

4. Crear la base de datos
```bash
mysql -u root -p < database/schema.sql
```

## 🧞 Comandos

| Comando                   | Acción                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Instala dependencias                             |
| `npm run dev`             | Inicia servidor local en `localhost:4321`        |
| `npm run build`           | Construye el sitio de producción en `./dist/`    |
| `npm run preview`         | Previsualiza la build localmente                 |

## 🌐 Configuración para Producción

### URL Base (Importante para códigos QR)

Los certificados médicos generan códigos QR con enlaces de verificación. Para que estos funcionen correctamente en producción, debes configurar la variable `APP_BASE_URL` en tu archivo `.env`:

**Desarrollo local:**
```env
APP_BASE_URL=http://localhost:4321
```

**Producción:**
```env
APP_BASE_URL=https://tudominio.com
```

**Ejemplos según plataforma:**
```env
# Vercel
APP_BASE_URL=https://tu-app.vercel.app

# Netlify
APP_BASE_URL=https://tu-app.netlify.app

# Dominio propio
APP_BASE_URL=https://salud.tuempresa.com
```

### Detección Automática

Si no configuras `APP_BASE_URL`, el sistema intentará detectar automáticamente la URL usando:
- Variables de entorno de Vercel (`VERCEL_URL`)
- Variables de entorno de Netlify (`URL`)
- Variables de entorno de Railway/Render/Heroku (`PUBLIC_URL`)
- NODE_ENV para determinar si está en producción

Sin embargo, **se recomienda configurar explícitamente** `APP_BASE_URL` para evitar problemas.

## 📧 Configuración de Correo

Para el envío de certificados por correo electrónico, configura las variables SMTP en el `.env`:

```env
SMTP_HOST=tu-servidor-smtp.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=tu-email@dominio.com
SMTP_PASSWORD=tu-contraseña
SMTP_FROM_EMAIL=noreply@tudominio.com
SMTP_FROM_NAME=Sistema de Salud Ocupacional
```

## 🗄️ Base de Datos

El esquema de la base de datos se encuentra en `database/schema.sql` e incluye:
- Gestión de usuarios (administradores, doctores)
- Pacientes y empresas
- Citas médicas
- Historias médicas
- Certificados de aptitud laboral
- Sistema de códigos de invitación

## 🔐 Credenciales Demo

```
Email: demo@empresa.com
Contraseña: 123456
```

## 📝 Notas Importantes

1. **Seguridad**: Cambia el `JWT_SECRET` en producción
2. **Códigos QR**: Asegúrate de configurar `APP_BASE_URL` correctamente
3. **Certificados**: Las firmas digitales se almacenan en `public/uploads/signatures/`
4. **Fotos de pacientes**: Se almacenan en `public/uploads/patients/`

## 🚨 Solución de Problemas

### Los códigos QR apuntan a localhost en producción

**Solución:** Configura la variable `APP_BASE_URL` en tu archivo `.env` con la URL de producción:
```env
APP_BASE_URL=https://tudominio.com
```

Reinicia el servidor después de cambiar las variables de entorno.

### Las firmas no aparecen en los certificados

**Corregido en v1.1.1:** El sistema ahora detecta automáticamente la ubicación correcta de las firmas tanto en desarrollo como en producción. Ver `CHANGELOG-FIRMAS.md` para más detalles.

Si aún tienes problemas:
1. Verifica que el archivo de firma existe: `ls public/uploads/signatures/`
2. Después del build, verifica: `ls dist/client/uploads/signatures/`
3. Revisa los logs del servidor al generar un certificado

### No se capturan fotos/firmas en registro de pacientes

**Corregido en v1.1.2:** Los archivos ahora se suben correctamente en producción. Ver `CORRECCION-REGISTRO-PACIENTES.md` para más detalles.

**Problema identificado:**
- La firma no se subía al servidor (solo se guardaba localmente)
- Los endpoints escribían en `public/` que no existe en producción

**Solución:**
- La firma ahora se sube inmediatamente al capturarla
- Los endpoints detectan automáticamente si están en desarrollo o producción
- Archivos se guardan en `dist/client/uploads/` en producción

Si aún tienes problemas:
1. Verifica que aparecen las alertas "Foto Lista" y "Firma Lista" al capturar
2. Revisa los logs del servidor: deben mostrar "Modo producción detectado"
3. Verifica que los archivos se guardan en `dist/client/uploads/`

## 📚 Documentación Adicional

Para más información sobre Astro: [Documentación de Astro](https://docs.astro.build)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

[Especifica tu licencia aquí]
