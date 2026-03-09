const nodemailer = require('nodemailer');
require('dotenv').config();

async function main() {
  console.log('--- Probando envío de correos ---');
  
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465');
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;

  console.log('Configuración:', {
    host,
    port,
    secure,
    user,
    pass: pass ? '******' : 'MISSING',
    fromEmail
  });

  if (!host || !user || !pass) {
    console.error('ERROR: Faltan variables de entorno SMTP_HOST, SMTP_USER o SMTP_PASSWORD');
    return;
  }

  // Replicando la configuración exacta de src/lib/mail-service.ts
  const transportConfig = {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      // Hardcoded en el código original
      servername: 'smtp.hostinger.com'
    },
    debug: true, // Para ver más detalles
    logger: true 
  };

  console.log('Creando transporte con config:', JSON.stringify({
    ...transportConfig,
    auth: { user, pass: '******' }
  }, null, 2));

  const transporter = nodemailer.createTransport(transportConfig);

  try {
    console.log('Verificando conexión...');
    await transporter.verify();
    console.log('Conexión SMTP verificada exitosamente.');

    console.log('Enviando correo de prueba...');
    const info = await transporter.sendMail({
      from: fromEmail,
      to: user, // Enviamos al mismo usuario para probar
      subject: 'Prueba de diagnóstico de correo',
      text: 'Si ves esto, el envío de correos funciona correctamente.',
      html: '<p>Si ves esto, el envío de correos funciona correctamente.</p>'
    });

    console.log('Correo enviado:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error('ERROR AL ENVIAR CORREO:');
    console.error(err);
  }
}

main().catch(console.error);
