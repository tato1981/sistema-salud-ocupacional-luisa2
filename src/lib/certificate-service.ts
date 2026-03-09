import { db } from './database.js';
import { getBaseUrl } from './utils.js';
import dayjs from 'dayjs';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export type AptitudeStatus = 'apto' | 'apto_con_restricciones' | 'apto_manipulacion_alimentos' | 'apto_trabajo_alturas' | 'apto_espacios_confinados' | 'apto_conduccion';

export interface IssueCertificateParams {
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  aptitudeStatus: AptitudeStatus;
  restrictions?: string;
  recommendations?: string;
  validityStart?: string; // YYYY-MM-DD
  validityEnd?: string;   // YYYY-MM-DD
}

function generateCode(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    // Reemplazar caracteres problemáticos comunes que no están en WinAnsi
    .replace(/[\u2018\u2019]/g, "'") // Comillas simples curvas
    .replace(/[\u201C\u201D]/g, '"') // Comillas dobles curvas
    .replace(/[\u2013\u2014]/g, '-') // Guiones largos
    .replace(/\u2026/g, '...')       // Puntos suspensivos
    .replace(/\u00A0/g, ' ');        // Espacio de no separación
}

export class CertificateService {
  private static addGeneralObservations(doc: PDFKit.PDFDocument, contentWidth: number) {
    const startX = 50;
    
    doc.moveDown(0.5);
    
    // OBSERVACIONES GENERALES PARA EL TRABAJADOR
    const header1Y = doc.y;
    doc.rect(startX, header1Y, contentWidth, 15).fill('#e5e7eb'); // Gray background
    doc.fillColor('#000000');
    doc.font('Helvetica-Bold').fontSize(8).text(cleanText('OBSERVACIONES GENERALES PARA EL TRABAJADOR'), startX, header1Y + 4, { width: contentWidth, align: 'center' });
    
    doc.y = header1Y + 20;
    doc.font('Helvetica').fontSize(7);
    
    const workerObs = [
      'Atender las recomendaciones y/o restricciones emitidas en este concepto, tanto en el ámbito intralaboral como extralaboral',
      'Cumplir las normas, reglamentos e instrucciones del SG-SST, incluyendo el uso correcto de los EPP cuando aplique.',
      'Participar en las actividades de capacitación definidas en el SG-SST',
      'Estilos de vida saludable: Realizar ejercicio mínimo 3 veces a la semana, dieta equilibrada, consumo de agua, procurar adecuada higiene del sueño, evitar consumo de tabaco y alcohol.',
      'Otras Recomendaciones: Uso de EPP de acuerdo al riesgo de exposición, pausas activas de acuerdo a las normas de la empresa, alternar tareas con el fin de disminuir posiciones prolongadas y movimientos repetitivos, estilo de vida saludable, alimentación balanceada, ejercicio diario mínimo 1 hora, higiene postural, valoración médico ocupacional periódica. Participar en las actividades del SG-SST. Levantamiento adecuado de peso.'
    ];
    
    workerObs.forEach(obs => {
        const currentY = doc.y;
        const bulletX = startX + 5;
        const textX = startX + 15;
        const textWidth = contentWidth - 15;
        
        doc.text('•', bulletX, currentY);
        doc.text(cleanText(obs), textX, currentY, { width: textWidth, align: 'justify' });
        doc.moveDown(0.2);
    });

    doc.moveDown(0.2);

    // OBSERVACIONES GENERALES PARA LA EMPRESA
    const header2Y = doc.y;
    doc.rect(startX, header2Y, contentWidth, 15).fill('#e5e7eb');
    doc.fillColor('#000000');
    doc.font('Helvetica-Bold').fontSize(8).text(cleanText('OBSERVACIONES GENERALES PARA LA EMPRESA'), startX, header2Y + 4, { width: contentWidth, align: 'center' });
    
    doc.y = header2Y + 20;
    doc.font('Helvetica').fontSize(7);
    
    const companyObs = [
      'Comunicar al trabajador el concepto y recomendaciones emitidas en este documento',
      'Realizar periódicamente todos los exámenes definidos según perfil del cargo',
      'Inducción y capacitación periódica, acordes a las funciones y riesgos del cargo'
    ];
    
    companyObs.forEach(obs => {
        const currentY = doc.y;
        const bulletX = startX + 5;
        const textX = startX + 15;
        const textWidth = contentWidth - 15;
        
        doc.text('•', bulletX, currentY);
        doc.text(cleanText(obs), textX, currentY, { width: textWidth, align: 'justify' });
        doc.moveDown(0.2);
    });
  }

  static async getPatientSummary(patientId: number) {
    const [rows] = await db.execute(
      `SELECT p.id, p.name, p.document_type, p.document_number, p.email, p.phone, p.occupation, COALESCE(c.name, p.company) as company, c.responsible_name as company_responsible, p.date_of_birth, p.photo_path, p.signature_path
       FROM patients p
       LEFT JOIN companies c ON p.company_id = c.id
       WHERE p.id = ?`,
      [patientId]
    );
    const arr = rows as any[];
    return arr.length > 0 ? arr[0] : null;
  }

  static async getDoctorSummary(doctorId: number) {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.specialization, u.professional_license, u.document_number, u.signature_path
       FROM users u WHERE u.id = ?`,
      [doctorId]
    );
    const arr = rows as any[];
    return arr.length > 0 ? arr[0] : null;
  }

  static async getAppointmentInfo(appointmentId: number) {
    const [rows] = await db.execute(
      `SELECT id, appointment_type, appointment_date FROM appointments WHERE id = ?`,
      [appointmentId]
    );
    const arr = rows as any[];
    return arr.length > 0 ? arr[0] : null;
  }

  static async issueCertificate(params: IssueCertificateParams): Promise<{ success: boolean; message?: string; certificateId?: number; pdfBuffer?: Buffer; verificationUrl?: string; }>{
    try {
      console.log('📋 Obteniendo datos del paciente y doctor...');

      // Ejecutar consultas en paralelo para mejorar rendimiento
      const [patient, doctor, appointmentInfo] = await Promise.all([
        this.getPatientSummary(params.patientId),
        this.getDoctorSummary(params.doctorId),
        params.appointmentId ? this.getAppointmentInfo(params.appointmentId) : Promise.resolve(null)
      ]);

      if (!patient) return { success: false, message: 'Paciente no encontrado' };

      if (!doctor || doctor.role !== 'doctor') {
        return { success: false, message: 'Doctor no autorizado: solo médicos pueden emitir certificados' };
      }

      // Generar código de verificación único
      const verificationCode = generateCode(32);

      // Insertar registro de certificado
      const [result] = await db.execute(
        `INSERT INTO work_certificates (
          patient_id, doctor_id, appointment_id, aptitude_status, restrictions, recommendations,
          validity_start, validity_end, verification_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          params.patientId,
          params.doctorId,
          params.appointmentId || null,
          params.aptitudeStatus,
          params.restrictions || null,
          params.recommendations || null,
          params.validityStart || null,
          params.validityEnd || null,
          verificationCode
        ]
      );

      const certificateId = (result as any).insertId as number;
      const verificationUrl = `${getBaseUrl()}/certificates/verify?code=${encodeURIComponent(verificationCode)}`;

      // Actualizar medical_histories con el aptitude_status del certificado
      try {
        console.log('📝 Actualizando historial médico con concepto de aptitud...');

        // Buscar el historial médico asociado a esta cita
        if (params.appointmentId) {
          const [historyRows] = await db.execute(
            'SELECT id FROM medical_histories WHERE appointment_id = ? AND patient_id = ? LIMIT 1',
            [params.appointmentId, params.patientId]
          );

          if ((historyRows as any[]).length > 0) {
            const historyId = (historyRows as any[])[0].id;
            await db.execute(
              'UPDATE medical_histories SET aptitude_status = ?, restrictions = ? WHERE id = ?',
              [params.aptitudeStatus, params.restrictions || null, historyId]
            );
            console.log(`✅ Historial médico ID ${historyId} actualizado con aptitude_status: ${params.aptitudeStatus}`);
          } else {
            // Si no hay historial asociado a la cita, buscar el más reciente del paciente
            const [latestHistory] = await db.execute(
              'SELECT id FROM medical_histories WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1',
              [params.patientId]
            );

            if ((latestHistory as any[]).length > 0) {
              const historyId = (latestHistory as any[])[0].id;
              await db.execute(
                'UPDATE medical_histories SET aptitude_status = ?, restrictions = ? WHERE id = ?',
                [params.aptitudeStatus, params.restrictions || null, historyId]
              );
              console.log(`✅ Historial médico más reciente ID ${historyId} actualizado con aptitude_status: ${params.aptitudeStatus}`);
            } else {
              console.warn('⚠️ No se encontró historial médico para actualizar aptitude_status');
            }
          }
        } else {
          // Si no hay appointment_id, actualizar el historial más reciente del paciente
          const [latestHistory] = await db.execute(
            'SELECT id FROM medical_histories WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1',
            [params.patientId]
          );

          if ((latestHistory as any[]).length > 0) {
            const historyId = (latestHistory as any[])[0].id;
            await db.execute(
              'UPDATE medical_histories SET aptitude_status = ?, restrictions = ? WHERE id = ?',
              [params.aptitudeStatus, params.restrictions || null, historyId]
            );
            console.log(`✅ Historial médico más reciente ID ${historyId} actualizado con aptitude_status: ${params.aptitudeStatus}`);
          } else {
            console.warn('⚠️ No se encontró historial médico para actualizar aptitude_status');
          }
        }
      } catch (updateError) {
        console.error('❌ Error actualizando historial médico con aptitude_status:', updateError);
        // No fallar la emisión del certificado por este error
      }

      console.log('🔗 Generando código QR...');
      // Generar QR con configuración optimizada para rendimiento
      const qrBuffer = await QRCode.toBuffer(verificationUrl, { 
        type: 'png', 
        width: 250,  // Reducido aún más para mejor rendimiento
        errorCorrectionLevel: 'L',  // Corrección baja para máximo rendimiento
        margin: 2,  // Margen mínimo
        color: { 
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('✅ QR generado');

      // Construir PDF (Oficio/Legal)
      const doc = new PDFDocument({ size: 'LEGAL', margin: 50 });
      const chunks: Buffer[] = [];
      return await new Promise(async (resolve, reject) => {
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve({ success: true, certificateId, pdfBuffer, verificationUrl });
        });
        doc.on('error', (err) => reject(err));

        // Encabezado mejorado con diseño moderno y profesional
      const headerY = doc.y;
      const headerHeight = 70;
      const contentWidth = doc.page.width - 100;
      const headerWidth = doc.page.width;
      
      // Fondo del encabezado
      doc.rect(0, 0, headerWidth, headerHeight).fill('#1e3a8a'); // Azul profesional oscuro
      
      // Texto del encabezado
      doc.fillColor('#FFFFFF');
      doc.font('Helvetica-Bold').fontSize(14).text(cleanText('SISTEMA DE SALUD OCUPACIONAL'), 0, 20, { align: 'center', width: headerWidth });
      doc.fontSize(16).text(cleanText('CERTIFICADO DE APTITUD LABORAL'), 0, 40, { align: 'center', width: headerWidth });
      
      doc.fillColor('#000000');
      doc.y = headerHeight + 20;
      
      const pageWidth = doc.page.width - 100;

      doc.font('Helvetica').fontSize(8).text(
        cleanText('Emitido conforme a principios de evaluación de aptitud laboral y recomendaciones generales de la OMS/ILO para salud ocupacional.'),
        50,
        doc.y,
        { align: 'justify', width: contentWidth, lineGap: 1 }
      );

      doc.moveDown(0.8);
      
      // Información de emisión en recuadro con diseño moderno
      const infoBoxY = doc.y;
      doc.rect(50, infoBoxY, pageWidth, 40).fill('#f1f5f9').stroke('#cbd5e1'); // Gris muy claro
      doc.fillColor('#1e293b'); // Texto gris oscuro
      
      const issueDate = params.validityStart ? dayjs(params.validityStart) : dayjs();
      
      doc.y = infoBoxY + 12;
      
      // Columna 1: Fecha de Emisión (Alineada con inicio de vigencia)
      doc.font('Helvetica-Bold').fontSize(9).text(cleanText('FECHA DE EMISIÓN:'), 70, doc.y);
      doc.font('Helvetica').fontSize(10).text(cleanText(issueDate.format('DD/MM/YYYY')), 170, doc.y);
      
      // Columna 2: Vigencia (Si existe)
      if (params.validityStart || params.validityEnd) {
        doc.font('Helvetica-Bold').fontSize(9).text(cleanText('VIGENCIA:'), 280, doc.y);
        const validityText = `${params.validityStart ? dayjs(params.validityStart).format('DD/MM/YYYY') : 'Inicio'}  hasta  ${params.validityEnd ? dayjs(params.validityEnd).format('DD/MM/YYYY') : 'Indefinido'}`;
        doc.font('Helvetica').fontSize(10).text(cleanText(validityText), 340, doc.y);
      }
      
      doc.y = infoBoxY + 50;

      // Tipo de cita (si existe)
      if (appointmentInfo?.appointment_type) {
        doc.moveDown(0.2);
        /* Fecha de examen eliminada por solicitud */
        /*
        if (appointmentInfo.appointment_date) {
          doc.font('Helvetica').fontSize(8).text(
            cleanText(`Fecha de examen: ${dayjs(appointmentInfo.appointment_date).format('DD/MM/YYYY')}`),
            60
          );
          doc.moveDown(0.1);
        }
        */
        const appointmentTypeMap: Record<string, string> = {
          'examen_periodico': 'Examen Médico Periódico',
          'examen_ingreso': 'Examen de Ingreso',
          'examen_egreso': 'Examen de Egreso',
          'examen_reintegro': 'Examen de Reintegro',
          'consulta_general': 'Consulta General',
          'consulta_especializada': 'Consulta Especializada',
          'seguimiento': 'Seguimiento',
          'urgencias': 'Urgencias'
        };
        const appointmentTypeText = appointmentTypeMap[appointmentInfo.appointment_type] || appointmentInfo.appointment_type;

        const typeBoxY = doc.y;
        doc.rect(50, typeBoxY, pageWidth, 20).fill('#e0f2fe').stroke('#bae6fd');
        doc.fillColor('#000000');
        doc.font('Helvetica-Bold').fontSize(8).text(cleanText('Tipo de Cita:'), 60, typeBoxY + 6);
        doc.font('Helvetica').fontSize(8).text(cleanText(appointmentTypeText), 140, typeBoxY + 6);
        doc.y = typeBoxY + 25;
      }

      doc.moveDown(0.3);
      // Datos del paciente
      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('DATOS DEL PACIENTE'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.2);
      
      const patientTableY = doc.y;
      const colWidth = contentWidth / 2;
      
      // Fondo de tabla
      doc.rect(50, patientTableY, contentWidth, 55).fill('#f8f9fa').stroke('#e9ecef');
      doc.fillColor('#000000');
      
      // Columna Izquierda
      doc.font('Helvetica-Bold').fontSize(8).text(cleanText('Nombre:'), 60, patientTableY + 10);
      doc.font('Helvetica').text(cleanText(patient.name), 110, patientTableY + 10);
      
      doc.font('Helvetica-Bold').text(cleanText('Documento:'), 60, patientTableY + 25);
      doc.font('Helvetica').text(cleanText(`${patient.document_type || ''} ${patient.document_number || ''}`), 130, patientTableY + 25);
      
      doc.font('Helvetica-Bold').text(cleanText('Fecha Nac:'), 60, patientTableY + 40);
      doc.font('Helvetica').text(cleanText(patient.date_of_birth ? dayjs(patient.date_of_birth).format('DD/MM/YYYY') : 'N/A'), 120, patientTableY + 40);

      // Columna Derecha
      const col2X = 50 + colWidth + 10;
      doc.font('Helvetica-Bold').text(cleanText('Empresa:'), col2X, patientTableY + 10);
      doc.font('Helvetica').text(cleanText(patient.company || 'N/A'), col2X + 60, patientTableY + 10);
      
      doc.font('Helvetica-Bold').text(cleanText('Ocupación:'), col2X, patientTableY + 25);
      doc.font('Helvetica').text(cleanText(patient.occupation || 'N/A'), col2X + 70, patientTableY + 25);

      // Datos del profesional
      doc.y = patientTableY + 65;
      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('PROFESIONAL EVALUADOR'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.2);
      
      const doctorTableY = doc.y;
      doc.rect(50, doctorTableY, contentWidth, 40).fill('#f0f8ff').stroke('#b3d9ff');
      doc.fillColor('#000000');
      
      doc.font('Helvetica-Bold').fontSize(8).text(cleanText('Nombre:'), 60, doctorTableY + 10);
      doc.font('Helvetica').text(cleanText(doctor.name), 110, doctorTableY + 10);
      
      doc.font('Helvetica-Bold').text(cleanText('Especialidad:'), col2X, doctorTableY + 10);
      doc.font('Helvetica').text(cleanText(doctor.specialization || 'N/A'), col2X + 80, doctorTableY + 10);
      
      doc.font('Helvetica-Bold').text(cleanText('Registro:'), 60, doctorTableY + 25);
      doc.font('Helvetica').text(cleanText(doctor.professional_license || 'N/A'), 110, doctorTableY + 25);

      doc.y = doctorTableY + 50;

      doc.moveDown(0.3);
      // Resultado de aptitud
      const statusMap: Record<AptitudeStatus, string> = {
        'apto': 'APTO PARA EL TRABAJO',
        'apto_con_restricciones': 'APTO CON RESTRICCIONES',
        'apto_manipulacion_alimentos': 'APTO PARA MANIPULACIÓN DE ALIMENTOS',
        'apto_trabajo_alturas': 'APTO PARA TRABAJO EN ALTURAS',
        'apto_espacios_confinados': 'APTO PARA ESPACIOS CONFINADOS',
        'apto_conduccion': 'APTO PARA CONDUCCIÓN'
      };

      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('RESULTADO DE APTITUD'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.2);
      
      // Mostrar estado de aptitud con color de fondo según el estado
      const resultY = doc.y;
      let resultColor = '#dcfce7'; // verde claro por defecto
      if (params.aptitudeStatus === 'apto_con_restricciones') resultColor = '#fef9c3'; // amarillo
      
      doc.rect(50, resultY, contentWidth, 30).fill(resultColor);
      doc.fillColor('#000000');
      doc.fontSize(10).text(cleanText(statusMap[params.aptitudeStatus as AptitudeStatus] || 'NO DEFINIDO'), 60, resultY + 8, { align: 'left', width: contentWidth - 20 });

      doc.y = resultY + 40;

      if (params.aptitudeStatus === 'apto_con_restricciones') {
        doc.font('Helvetica-Bold').fontSize(10).text(cleanText('RESTRICCIONES / LIMITACIONES'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(8).text(cleanText(params.restrictions || 'Ninguna registrada'), 50, doc.y, { align: 'justify', width: contentWidth });
        doc.moveDown(0.4);
      }

      if (params.recommendations) {
        doc.font('Helvetica-Bold').fontSize(10).text(cleanText('RECOMENDACIONES'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(8).text(cleanText(params.recommendations), 50, doc.y, { align: 'justify', width: contentWidth });
        doc.moveDown(0.4);
      }

      // Observaciones generales (nuevo)
      this.addGeneralObservations(doc, contentWidth);

      doc.moveDown(0.4);
      // Nota OMS/ILO
      doc.font('Helvetica').fontSize(6).text(cleanText(footerNote()), { align: 'justify', width: doc.page.width - 100, lineGap: 1 });

      doc.moveDown(0.3);
      doc.moveDown(0.5);
      
      // Pie de firma con distribución izquierda/derecha
      const signatureY = doc.y + 30;
      const fullPageWidth = doc.page.width;

      // Firma Izquierda: Profesional
      doc.font('Helvetica').fontSize(8);
      doc.text('____________________________', 60, signatureY);
      doc.text(cleanText(doctor.name), 60, signatureY + 15);
      doc.text(cleanText(`C.C. ${doctor.document_number || 'N/A'}`), 60, signatureY + 28);
      doc.text(cleanText(`Registro No: ${doctor.professional_license || 'N/A'}`), 60, signatureY + 41);
      
      // Firma Derecha: Firma del Paciente
      const rightSigX = fullPageWidth - 250;
      doc.text(cleanText(patient.name), rightSigX, signatureY + 15);
      doc.text(cleanText(`${patient.document_type || 'C.C.'} ${patient.document_number || 'N/A'}`), rightSigX, signatureY + 28);
      doc.text(cleanText('Paciente'), rightSigX, signatureY + 41);

      // Código QR y verificación (ahora debajo de las firmas)
      doc.y = signatureY + 110;
      
      const qrBlockY = doc.y;
      const leftMargin = 50;
      const qrSize = 65;
      
      // QR a la izquierda
      doc.image(qrBuffer, leftMargin, qrBlockY, { fit: [qrSize, qrSize] });
      
      // Texto a la derecha del QR
      doc.font('Helvetica-Bold').fontSize(8).text(cleanText('Verificación:'), leftMargin + qrSize + 20, qrBlockY);
      doc.font('Helvetica').fontSize(6).text(cleanText(`Escanee el QR o visite: ${verificationUrl}`), leftMargin + qrSize + 20, qrBlockY + 15);
      doc.fontSize(6).text(cleanText(`Versión móvil: ${getBaseUrl()}/certificates/mobile?code=${encodeURIComponent(verificationCode)}`), leftMargin + qrSize + 20, qrBlockY + 25);

        doc.end();
      });
    } catch (error: any) {
      console.error('Error emitiendo certificado:', error);
      return { success: false, message: 'Error al emitir certificado' };
    }
  }

  static async getCertificateByCode(code: string) {
    const [rows] = await db.execute(
      `SELECT wc.*,
              p.name as patient_name,
              p.document_type,
              p.document_number,
              COALESCE(c.name, p.company) as company,
              c.responsible_name as company_responsible,
              p.occupation,
              p.date_of_birth,
              p.signature_path as patient_signature_path,
              u.name as doctor_name,
              u.specialization as doctor_specialization,
              u.professional_license as doctor_license,
              u.document_number as doctor_document,
              u.signature_path as doctor_signature_path,
              a.appointment_type,
              a.appointment_date
       FROM work_certificates wc
       LEFT JOIN patients p ON wc.patient_id = p.id
       LEFT JOIN companies c ON p.company_id = c.id
       LEFT JOIN users u ON wc.doctor_id = u.id
       LEFT JOIN appointments a ON wc.appointment_id = a.id
       WHERE wc.verification_code = ?`,
      [code]
    );
    const arr = rows as any[];
    return arr.length > 0 ? arr[0] : null;
  }

  static async renderPDFFromRecord(record: any): Promise<Buffer> {
    if (!record) {
      throw new Error('El registro del certificado es inválido o nulo.');
    }

    // Obtener datos relacionados de forma segura
    let patient = null;
    let doctor = null;

    try {
      if (record.patient_id) {
        patient = await this.getPatientSummary(record.patient_id);
      } else {
        console.warn('⚠️ Certificado sin patient_id:', record.id);
      }

      if (record.doctor_id) {
        doctor = await this.getDoctorSummary(record.doctor_id);
      } else {
        console.warn('⚠️ Certificado sin doctor_id:', record.id);
      }
    } catch (err) {
      console.error('❌ Error obteniendo detalles de paciente/doctor:', err);
      // Continuar con valores nulos para intentar generar el PDF de todas formas
    }

    // Fallback si no se encuentra la info (ej. usuario eliminado)
    // Usar datos del registro si están disponibles (por el JOIN en getCertificateByCode)
    if (!patient && record.patient_name) {
      patient = {
        name: record.patient_name,
        document_type: record.document_type,
        document_number: record.document_number,
        company: record.company,
        occupation: record.occupation,
        date_of_birth: record.date_of_birth,
        signature_path: record.patient_signature_path
      };
    }

    if (!doctor && record.doctor_name) {
      doctor = {
        name: record.doctor_name,
        specialization: record.doctor_specialization,
        professional_license: record.doctor_license,
        document_number: record.doctor_document,
        signature_path: record.doctor_signature_path
      };
    }

    const verificationCode = record.verification_code || 'INVALID_CODE';
    const verificationUrl = `${getBaseUrl()}/certificates/verify?code=${encodeURIComponent(verificationCode)}`;
    const qrBuffer = await QRCode.toBuffer(verificationUrl, { 
      type: 'png', 
      width: 300,  // Optimizado para rendimiento
      errorCorrectionLevel: 'M',  // Corrección media para mejor rendimiento
      margin: 4,  // Margen estándar
      color: { 
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Construir PDF (Oficio/Legal)
    const doc = new PDFDocument({ size: 'LEGAL', margin: 50 });
    const chunks: Buffer[] = [];

    return await new Promise(async (resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Encabezado con diseño moderno y profesional
      const headerY = doc.y;
      const headerHeight = 70;
      const contentWidth = doc.page.width - 100;
      const headerWidth = doc.page.width;
      
      // Fondo del encabezado (Full Width)
      doc.rect(0, 0, headerWidth, headerHeight).fill('#1e3a8a');
      
      // Texto del encabezado en blanco
      doc.fillColor('#FFFFFF');
      doc.font('Helvetica-Bold').fontSize(14).text(cleanText('SISTEMA DE SALUD OCUPACIONAL'), 0, 20, { align: 'center', width: headerWidth });
      doc.fontSize(16).text(cleanText('CERTIFICADO DE APTITUD LABORAL'), 0, 40, { align: 'center', width: headerWidth });
      
      // Restaurar color negro para el resto del documento
      doc.fillColor('#000000');
      doc.y = headerHeight + 20;
      
      const pageWidth = doc.page.width - 100;

      doc.font('Helvetica').fontSize(8).text(
        cleanText('Emitido conforme a principios de evaluación de aptitud laboral y recomendaciones generales de la OMS/ILO para salud ocupacional.'),
        50,
        doc.y,
        { align: 'justify', width: contentWidth, lineGap: 1 }
      );
      
      doc.moveDown(0.8);
      
      // Información de emisión en recuadro con diseño moderno
      const infoBoxY = doc.y;
      doc.rect(50, infoBoxY, pageWidth, 40).fill('#f1f5f9').stroke('#cbd5e1'); // Gris muy claro
      doc.fillColor('#1e293b'); // Texto gris oscuro
      
      // Lógica de fechas: Emisión = Inicio Vigencia si existe
      const issueDate = record.validity_start ? dayjs(record.validity_start) : dayjs(record.created_at || new Date());

      doc.y = infoBoxY + 12;
      
      // Columna 1: Fecha de Emisión
      doc.font('Helvetica-Bold').fontSize(9).text(cleanText('FECHA DE EMISIÓN:'), 70, doc.y);
      doc.font('Helvetica').fontSize(10).text(cleanText(issueDate.format('DD/MM/YYYY')), 170, doc.y);
      
      // Columna 2: Vigencia (Si existe)
      if (record.validity_start || record.validity_end) {
        doc.font('Helvetica-Bold').fontSize(9).text(cleanText('VIGENCIA:'), 280, doc.y);
        const validityText = `${record.validity_start ? dayjs(record.validity_start).format('DD/MM/YYYY') : 'Inicio'}  hasta  ${record.validity_end ? dayjs(record.validity_end).format('DD/MM/YYYY') : 'Indefinido'}`;
        doc.font('Helvetica').fontSize(10).text(cleanText(validityText), 340, doc.y);
      }
      
      doc.y = infoBoxY + 50;

      if (record.appointment_type) {
        doc.moveDown(0.2);
        /* Fecha de examen eliminada por solicitud */
        /*
        const examDateSource = record.appointment_date || record.certificate_date || record.created_at;
        if (examDateSource) {
          doc.font('Helvetica').fontSize(8).text(cleanText(`Fecha de examen: ${dayjs(examDateSource).format('DD/MM/YYYY')}`), 60);
          doc.moveDown(0.1);
        }
        */
        const appointmentTypeMap: Record<string, string> = {
          'examen_periodico': 'Examen Médico Periódico',
          'examen_ingreso': 'Examen de Ingreso',
          'examen_egreso': 'Examen de Egreso',
          'examen_reintegro': 'Examen de Reintegro',
          'consulta_general': 'Consulta General',
          'consulta_especializada': 'Consulta Especializada',
          'seguimiento': 'Seguimiento',
          'urgencias': 'Urgencias'
        };
        const appointmentTypeText = appointmentTypeMap[record.appointment_type] || record.appointment_type;

        const typeBoxY = doc.y;
        doc.rect(50, typeBoxY, headerWidth, 20).fill('#e0f2fe').stroke('#bae6fd');
        doc.fillColor('#000000');
        doc.font('Helvetica-Bold').fontSize(8).text(cleanText('Tipo de Cita:'), 60, typeBoxY + 6);
        doc.font('Helvetica').fontSize(8).text(cleanText(appointmentTypeText), 140, typeBoxY + 6);
        doc.y = typeBoxY + 25;
      }

        // Sección de datos del paciente con diseño mejorado
      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('DATOS DEL PACIENTE'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.2);
        
        // Tabla de datos del paciente
        const patientDataY = doc.y;
        const colWidth = contentWidth / 2;
        
        doc.rect(50, patientDataY, contentWidth, 55).fill('#f8f9fa').stroke('#e9ecef');
        doc.fillColor('#000000');
        
        // Columna Izquierda
        doc.font('Helvetica-Bold').fontSize(8).text(cleanText('Nombre:'), 60, patientDataY + 10);
        doc.font('Helvetica').text(cleanText(patient?.name || 'N/D'), 110, patientDataY + 10);
        
        doc.font('Helvetica-Bold').text(cleanText('Documento:'), 60, patientDataY + 25);
        doc.font('Helvetica').text(cleanText(`${patient?.document_type || ''} ${patient?.document_number || ''}`), 130, patientDataY + 25);
        
        doc.font('Helvetica-Bold').text(cleanText('Fecha Nac:'), 60, patientDataY + 40);
        doc.font('Helvetica').text(cleanText(patient?.date_of_birth ? dayjs(patient.date_of_birth).format('DD/MM/YYYY') : 'N/A'), 120, patientDataY + 40);

        // Columna Derecha
        const col2X = 50 + colWidth + 10;
        doc.font('Helvetica-Bold').text(cleanText('Empresa:'), col2X, patientDataY + 10);
        doc.font('Helvetica').text(cleanText(patient?.company || 'N/A'), col2X + 60, patientDataY + 10);
        
        doc.font('Helvetica-Bold').text(cleanText('Ocupación:'), col2X, patientDataY + 25);
        doc.font('Helvetica').text(cleanText(patient?.occupation || 'N/A'), col2X + 70, patientDataY + 25);
        
        doc.y = patientDataY + 65;

      // Datos del profesional con diseño mejorado
      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('PROFESIONAL EVALUADOR'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.2);
      
      const doctorDataY = doc.y;
      doc.rect(50, doctorDataY, contentWidth, 40).fill('#f0f8ff').stroke('#b3d9ff');
      doc.fillColor('#000000');
      
      doc.font('Helvetica-Bold').fontSize(8).text(cleanText('Nombre:'), 60, doctorDataY + 10);
      doc.font('Helvetica').text(cleanText(doctor?.name || 'N/D'), 110, doctorDataY + 10);
      
      doc.font('Helvetica-Bold').text(cleanText('Especialidad:'), col2X, doctorDataY + 10);
      doc.font('Helvetica').text(cleanText(doctor?.specialization || 'N/A'), col2X + 80, doctorDataY + 10);
      
      doc.font('Helvetica-Bold').text(cleanText('Registro:'), 60, doctorDataY + 25);
      doc.font('Helvetica').text(cleanText(doctor?.professional_license || 'N/A'), 110, doctorDataY + 25);
      
      doc.y = doctorDataY + 50;

      // Definir estados de aptitud
      const statusMap: Record<AptitudeStatus, string> = {
        'apto': 'APTO PARA EL TRABAJO',
        'apto_con_restricciones': 'APTO CON RESTRICCIONES',
        'apto_manipulacion_alimentos': 'APTO PARA MANIPULACIÓN DE ALIMENTOS',
        'apto_trabajo_alturas': 'APTO PARA TRABAJO EN ALTURAS',
        'apto_espacios_confinados': 'APTO PARA ESPACIOS CONFINADOS',
        'apto_conduccion': 'APTO PARA CONDUCCIÓN'
      };

      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('RESULTADO DE APTITUD'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.2);
      
      // Mostrar estado de aptitud con color de fondo según el estado
      const resultY = doc.y;
      let resultColor = '#dcfce7'; // verde claro por defecto
      if (record.aptitude_status === 'apto_con_restricciones') resultColor = '#fef9c3'; // amarillo
      
      doc.rect(50, resultY, contentWidth, 30).fill(resultColor);
      doc.fillColor('#000000');
      doc.fontSize(10).text(cleanText(statusMap[record.aptitude_status as AptitudeStatus] || 'NO DEFINIDO'), 60, resultY + 8, { align: 'left', width: contentWidth - 20 });

      doc.y = resultY + 40;

      if (record.aptitude_status === 'apto_con_restricciones') {
        doc.font('Helvetica-Bold').fontSize(10).text(cleanText('RESTRICCIONES / LIMITACIONES'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(8).text(cleanText(record.restrictions || 'Ninguna registrada'), 50, doc.y, { align: 'justify', width: contentWidth });
        doc.moveDown(0.4);
      }

      if (record.recommendations) {
        doc.font('Helvetica-Bold').fontSize(10).text(cleanText('RECOMENDACIONES'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(8).text(cleanText(record.recommendations), 50, doc.y, { align: 'justify', width: contentWidth });
        doc.moveDown(0.4);
      }

      // Observaciones generales (nuevo)
      this.addGeneralObservations(doc, contentWidth);

      doc.moveDown(0.5);

      // Pie de firma con distribución izquierda/derecha
      const signatureY = doc.y + 30;
      const fullPageWidth = doc.page.width;

      // Firma Izquierda: Profesional
      doc.font('Helvetica').fontSize(8);
      doc.text('____________________________', 60, signatureY);
      doc.text(cleanText(doctor?.name || ''), 60, signatureY + 15);
      doc.text(cleanText(`C.C. ${doctor?.document_number || 'N/A'}`), 60, signatureY + 28);
      doc.text(cleanText(`Registro No: ${doctor?.professional_license || 'N/A'}`), 60, signatureY + 41);

      // Firma Derecha: Firma del Paciente
      const rightSigX = fullPageWidth - 250;
      doc.text(cleanText(patient?.name || ''), rightSigX, signatureY + 15);
      doc.text(cleanText(`${patient?.document_type || 'C.C.'} ${patient?.document_number || 'N/A'}`), rightSigX, signatureY + 28);
      doc.text(cleanText('Paciente'), rightSigX, signatureY + 41);

      // Código QR y verificación (ahora debajo de las firmas)
      doc.y = signatureY + 110;

      const qrBlockY = doc.y;
      const leftMargin = 50;
      const qrSize = 65; // Reduced QR size
      doc.image(qrBuffer, leftMargin, qrBlockY, { fit: [qrSize, qrSize] });
      
      doc.fontSize(8).text(cleanText('Verificación:'), leftMargin + qrSize + 20, qrBlockY);
      doc.fontSize(6).text(cleanText(`Código: ${record.verification_code}`), leftMargin + qrSize + 20, qrBlockY + 15);
      doc.text(cleanText(`Escanee el QR para validar este certificado`), leftMargin + qrSize + 20, qrBlockY + 30);

      doc.end();
    });
  }
}

function footerNote(): string {
  return process.env.OMS_FOOTER_NOTE || 'Nota: Este certificado se emite siguiendo prácticas de salud ocupacional y principios de evaluación de aptitud laboral, considerando recomendaciones generales de la OMS y la OIT, e información clínico-laboral disponible al momento de la evaluación.';
}
