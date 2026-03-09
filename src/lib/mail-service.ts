import nodemailer from 'nodemailer';

export interface MailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export class MailService {
  private static transporter: nodemailer.Transporter | null = null;

  static ensureConfigured() {
    if (this.transporter) return;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '465');
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    console.log('Configurando servicio de correo con:', {
      host,
      port,
      secure,
      user: user ? '***' : 'missing',
    });

    if (!host || !user || !pass) {
      throw new Error('Faltan variables de entorno SMTP (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        // Necesario cuando se usa IP en vez de dominio para evitar error de certificado
        servername: 'smtp.hostinger.com'
      }
    });
  }

  static async sendMail(opts: {
    to: string[];
    subject: string;
    html: string;
    text?: string;
    attachments?: MailAttachment[];
    fromEmail?: string;
    fromName?: string;
  }) {
    const { to, subject, html, text, attachments, fromEmail, fromName } = opts;

    if (!to || to.length === 0) {
      throw new Error('No se proporcionaron destinatarios');
    }

    this.ensureConfigured();

    const defaultFromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@localhost';
    const defaultFromName = process.env.SMTP_FROM_NAME || 'Salud Ocupacional';

    const senderEmail = fromEmail || defaultFromEmail;
    const senderName = fromName || defaultFromName;
    const from = `"${senderName}" <${senderEmail}>`;

    const mailOptions = {
      from,
      to, // Nodemailer accepts array of strings
      subject,
      html,
      text, // Versión en texto plano para mejorar entregabilidad
      attachments: (attachments || []).map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType
      }))
    };

    try {
      if (!this.transporter) {
        throw new Error("Transporter not initialized");
      }
      
      console.log(`Intentando enviar correo a: ${to.join(', ')}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado correctamente:', info.messageId);
      return info;
    } catch (error: any) {
      console.error('Error enviando email:', {
        message: error.message,
        code: error.code,
        response: error.response,
      });
      throw error;
    }
  }

  static async sendLoginNotification(opts: {
    to: string;
    userName: string;
    loginTime: string;
    userRole: string;
    ipAddress: string;
  }) {
    const { to, userName, loginTime, userRole, ipAddress } = opts;

    const subject = `Nuevo Inicio de Sesión Detectado - Sistema de Salud Ocupacional`;
    
    // Versión texto plano
    const text = `
Hola ${userName},

Se ha detectado un nuevo inicio de sesión en tu cuenta del Sistema de Salud Ocupacional.

Detalles del inicio de sesión:
- Fecha y Hora: ${loginTime}
- Rol: ${userRole}
- IP: ${ipAddress}

Si fuiste tú, puedes ignorar este mensaje.
Si no reconoces esta actividad, por favor contacta inmediatamente al administrador del sistema.

Sistema de Salud Ocupacional
    `.trim();

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo Inicio de Sesión</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .header { background-color: #6c757d; color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 30px 20px; }
        .info-box { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .info-item { margin-bottom: 10px; }
        .info-item:last-child { margin-bottom: 0; }
        .info-label { font-weight: bold; color: #555; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
        .warning-text { color: #856404; font-size: 14px; margin-top: 20px; padding: 10px; background-color: #fff3cd; border-left: 4px solid #ffeeba; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nuevo Inicio de Sesión</h1>
        </div>
        
        <div class="content">
          <p>Hola <strong>${userName}</strong>,</p>
          <p>Se ha detectado un nuevo inicio de sesión en tu cuenta.</p>
          
          <div class="info-box">
            <div class="info-item">
              <span class="info-label">📅 Fecha y Hora:</span> ${loginTime}
            </div>
            <div class="info-item">
              <span class="info-label">👤 Rol:</span> ${userRole}
            </div>
            <div class="info-item">
              <span class="info-label">🌐 Dirección IP:</span> ${ipAddress}
            </div>
          </div>

          <div class="warning-text">
            <strong>¿No fuiste tú?</strong><br>
            Si no reconoces esta actividad, por favor contacta inmediatamente al administrador del sistema para asegurar tu cuenta.
          </div>
        </div>

        <div class="footer">
          <p>Sistema de Salud Ocupacional</p>
          <p>Este es un mensaje de seguridad automático.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.sendMail({
      to: [to],
      subject,
      html,
      text,
      fromName: 'Sistema de Salud Ocupacional'
    });
  }
}
