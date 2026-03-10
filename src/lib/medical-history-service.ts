// Servicio para manejo de Historias Médicas Ocupacionales
// Basado en estándares de la OMS para Salud Ocupacional
import { db } from './database.js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
import { CertificateService } from './certificate-service.js';

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ');
}

function footerNote(): string {
  return "Este documento es una historia clínica ocupacional y contiene información confidencial amparada por la reserva legal. Su contenido solo puede ser conocido por el paciente, el equipo de salud y las autoridades competentes.";
}

export interface VitalSigns {
  // Signos vitales básicos
  systolic_pressure?: number;
  diastolic_pressure?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  temperature?: number;
  oxygen_saturation?: number;
  
  // Medidas antropométricas
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  
  // Medidas adicionales ocupacionales
  waist_circumference?: number; // cm
  hip_circumference?: number; // cm
  body_fat_percentage?: number;
}

export interface OccupationalAssessment {
  // Evaluación ocupacional específica
  work_environment_risk?: string;
  exposure_to_chemicals?: boolean;
  exposure_to_noise?: boolean;
  exposure_to_radiation?: boolean;
  ergonomic_risks?: boolean;
  psychological_stress_level?: 'bajo' | 'moderado' | 'alto' | 'muy_alto';
  
  // Capacidad laboral
  physical_capacity?: 'normal' | 'limitada' | 'muy_limitada';
  fitness_for_work?: 'apto' | 'apto_con_restricciones' | 'no_apto' | 'apto_temporal';
  work_restrictions?: string[];
  
  // Recomendaciones preventivas
  occupational_recommendations?: string[];
}

export interface MedicalHistoryData {
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  
  // Motivo de consulta
  symptoms: string;
  current_illness?: string;
  chief_complaint?: string;
  
  // Antecedentes
  personal_history?: string;
  family_history?: string;
  surgical_history?: string;
  occupational_history?: string;
  
  // Examen físico
  physical_exam?: string;
  vital_signs?: VitalSigns;
  
  // Evaluación ocupacional
  occupational_assessment?: OccupationalAssessment;
  
  // Diagnóstico
  diagnosis: string;
  cie10_code?: string;
  aptitude_status?: 'apto' | 'apto_con_restricciones' | 'no_apto' | 'aplazado';
  restrictions?: string;
  
  // Tratamiento
  treatment: string;
  medications?: string;
  recommendations?: string;
  
  // Seguimiento
  next_appointment_date?: string;
  notes?: string;
}

export class MedicalHistoryService {
  
  // Calcular IMC y clasificación según OMS
  static calculateBMI(weight: number, height: number): { bmi: number; classification: string; risk: string; recommendations: string[] } {
    const heightInMeters = height / 100;
    const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
    
    let classification = '';
    let risk = '';
    let recommendations: string[] = [];
    
    if (bmi < 18.5) {
      classification = 'Bajo peso';
      risk = 'Riesgo de desnutrición';
      recommendations = [
        'Evaluación nutricional detallada',
        'Consulta con nutricionista',
        'Incremento gradual de ingesta calórica',
        'Evaluación de causas subyacentes',
        'Seguimiento médico regular'
      ];
    } else if (bmi >= 18.5 && bmi < 25) {
      classification = 'Peso normal';
      risk = 'Riesgo normal';
      recommendations = [
        'Mantener peso actual',
        'Dieta balanceada y ejercicio regular',
        'Controles médicos anuales',
        'Promoción de hábitos saludables'
      ];
    } else if (bmi >= 25 && bmi < 30) {
      classification = 'Sobrepeso';
      risk = 'Riesgo aumentado';
      recommendations = [
        'Reducción de peso gradual (5-10%)',
        'Plan nutricional personalizado',
        'Ejercicio aeróbico 150 min/semana',
        'Control de comorbilidades',
        'Seguimiento médico cada 6 meses'
      ];
    } else if (bmi >= 30 && bmi < 35) {
      classification = 'Obesidad grado I';
      risk = 'Riesgo alto';
      recommendations = [
        'Pérdida de peso estructurada (10-15%)',
        'Intervención nutricional intensiva',
        'Programa de ejercicio supervisado',
        'Evaluación cardiovascular',
        'Control de diabetes e hipertensión',
        'Seguimiento médico mensual'
      ];
    } else if (bmi >= 35 && bmi < 40) {
      classification = 'Obesidad grado II';
      risk = 'Riesgo muy alto';
      recommendations = [
        'Pérdida de peso significativa (15-20%)',
        'Manejo multidisciplinario',
        'Evaluación psicológica',
        'Consideración de farmacoterapia',
        'Evaluación quirúrgica si es necesario',
        'Seguimiento médico quincenal'
      ];
    } else {
      classification = 'Obesidad grado III (mórbida)';
      risk = 'Riesgo extremo';
      recommendations = [
        'Pérdida de peso urgente',
        'Manejo hospitalario si es necesario',
        'Evaluación para cirugía bariátrica',
        'Control estricto de comorbilidades',
        'Soporte psicológico intensivo',
        'Seguimiento médico semanal'
      ];
    }
    
    return { bmi, classification, risk, recommendations };
  }
  
  // Evaluar presión arterial según JNC 8 y AHA 2017
  static evaluateBloodPressure(systolic: number, diastolic: number): { 
    classification: string; 
    risk: string; 
    recommendations: string[];
    occupational_fitness: string;
  } {
    let classification = '';
    let risk = '';
    let recommendations: string[] = [];
    let occupational_fitness = '';
    
    if (systolic < 120 && diastolic < 80) {
      classification = 'Presión arterial normal';
      risk = 'Riesgo cardiovascular bajo';
      occupational_fitness = 'Apto para todas las actividades laborales';
      recommendations = [
        'Mantener estilo de vida saludable',
        'Control anual de presión arterial',
        'Ejercicio regular',
        'Dieta balanceada baja en sodio'
      ];
    } else if ((systolic >= 120 && systolic <= 129) && diastolic < 80) {
      classification = 'Presión arterial elevada';
      risk = 'Riesgo cardiovascular moderado';
      occupational_fitness = 'Apto con recomendaciones preventivas';
      recommendations = [
        'Modificaciones de estilo de vida',
        'Control cada 6 meses',
        'Reducción de peso si es necesario',
        'Limitación de sodio (<2.3g/día)',
        'Ejercicio aeróbico regular',
        'Manejo del estrés laboral'
      ];
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      classification = 'Hipertensión arterial estadio 1';
      risk = 'Riesgo cardiovascular alto';
      occupational_fitness = 'Apto con restricciones específicas';
      recommendations = [
        'Inicio de tratamiento farmacológico',
        'Control mensual hasta estabilización',
        'Evaluación de daño a órganos blanco',
        'Restricción de trabajos de alto estrés',
        'Evitar exposición a calor extremo',
        'Evaluación cardiológica anual'
      ];
    } else if (systolic >= 140 || diastolic >= 90) {
      classification = 'Hipertensión arterial estadio 2';
      risk = 'Riesgo cardiovascular muy alto';
      occupational_fitness = 'Apto con restricciones importantes';
      recommendations = [
        'Tratamiento farmacológico inmediato',
        'Control semanal inicial',
        'Evaluación cardiológica urgente',
        'Restricción de trabajos físicos intensos',
        'Evitar trabajos en alturas',
        'Programa de rehabilitación cardiovascular'
      ];
    }
    
    if (systolic >= 180 || diastolic >= 110) {
      classification = 'Crisis hipertensiva';
      risk = 'Riesgo cardiovascular crítico';
      occupational_fitness = 'No apto temporalmente';
      recommendations = [
        'Derivación inmediata a emergencias',
        'Evaluación de encefalopatía hipertensiva',
        'Suspensión temporal de actividades laborales',
        'Hospitalización si es necesario'
      ];
    }
    
    return { classification, risk, recommendations, occupational_fitness };
  }
  
  // Evaluar frecuencia cardíaca
  static evaluateHeartRate(heartRate: number, age: number): {
    classification: string;
    recommendations: string[];
    occupational_fitness: string;
  } {
    let classification = '';
    let recommendations: string[] = [];
    let occupational_fitness = '';
    
    const maxHeartRate = 220 - age;
    const targetLow = maxHeartRate * 0.5;
    const targetHigh = maxHeartRate * 0.85;
    
    if (heartRate < 60) {
      classification = 'Bradicardia';
      occupational_fitness = 'Requiere evaluación cardiológica';
      recommendations = [
        'Evaluación cardiológica completa',
        'Electrocardiograma',
        'Evaluación de medicamentos',
        'Considerar Holter de 24 horas',
        'Restricción temporal de actividades intensas'
      ];
    } else if (heartRate >= 60 && heartRate <= 100) {
      classification = 'Frecuencia cardíaca normal';
      occupational_fitness = 'Apto para actividades normales';
      recommendations = [
        'Mantener actividad física regular',
        'Control anual de función cardiovascular'
      ];
    } else if (heartRate > 100 && heartRate <= 120) {
      classification = 'Taquicardia leve';
      occupational_fitness = 'Apto con recomendaciones';
      recommendations = [
        'Evaluación de causas subyacentes',
        'Control de ansiedad y estrés',
        'Limitación de cafeína',
        'Evaluación tiroidea',
        'Seguimiento médico'
      ];
    } else {
      classification = 'Taquicardia significativa';
      occupational_fitness = 'Requiere evaluación inmediata';
      recommendations = [
        'Evaluación cardiológica urgente',
        'Electrocardiograma inmediato',
        'Control de signos vitales',
        'Suspensión temporal de esfuerzos intensos'
      ];
    }
    
    return { classification, recommendations, occupational_fitness };
  }
  
  // Crear nueva historia médica ocupacional
  static async createMedicalHistory(data: MedicalHistoryData): Promise<{ 
    success: boolean; 
    message: string; 
    medical_history?: any;
    calculated_data?: any;
  }> {
    try {
      // Generar código de verificación
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let verificationCode = '';
      for (let i = 0; i < 32; i++) verificationCode += chars[Math.floor(Math.random() * chars.length)];

      // Calcular y agregar datos automáticos si hay signos vitales
      let calculatedData: any = {};
      
      if (data.vital_signs) {
        // Calcular IMC si hay peso y altura
        if (data.vital_signs.weight && data.vital_signs.height) {
          const bmiData = this.calculateBMI(data.vital_signs.weight, data.vital_signs.height);
          data.vital_signs.bmi = bmiData.bmi;
          calculatedData.bmi_analysis = bmiData;
        }
        
        // Evaluar presión arterial
        if (data.vital_signs.systolic_pressure && data.vital_signs.diastolic_pressure) {
          calculatedData.blood_pressure_analysis = this.evaluateBloodPressure(
            data.vital_signs.systolic_pressure,
            data.vital_signs.diastolic_pressure
          );
        }
        
        // Evaluar frecuencia cardíaca (necesitamos la edad del paciente)
        if (data.vital_signs.heart_rate) {
          // Obtener edad del paciente
          const [patientRows] = await db.execute(
            'SELECT date_of_birth FROM patients WHERE id = ?',
            [data.patient_id]
          );
          
          if ((patientRows as any[]).length > 0) {
            const birthDate = new Date((patientRows as any[])[0].date_of_birth);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            
            calculatedData.heart_rate_analysis = this.evaluateHeartRate(
              data.vital_signs.heart_rate,
              age
            );
          }
        }
      }
      
      // Agregar recomendaciones automáticas basadas en los análisis
      const autoRecommendations: string[] = [];
      
      if (calculatedData.bmi_analysis) {
        autoRecommendations.push(`IMC: ${calculatedData.bmi_analysis.classification} (${calculatedData.bmi_analysis.bmi})`);
        autoRecommendations.push(...calculatedData.bmi_analysis.recommendations);
      }
      
      if (calculatedData.blood_pressure_analysis) {
        autoRecommendations.push(`Presión arterial: ${calculatedData.blood_pressure_analysis.classification}`);
        autoRecommendations.push(...calculatedData.blood_pressure_analysis.recommendations);
      }
      
      if (calculatedData.heart_rate_analysis) {
        autoRecommendations.push(`Frecuencia cardíaca: ${calculatedData.heart_rate_analysis.classification}`);
        autoRecommendations.push(...calculatedData.heart_rate_analysis.recommendations);
      }
      
      // Combinar recomendaciones manuales con automáticas
      const finalRecommendations = [
        ...(data.recommendations ? [data.recommendations] : []),
        ...autoRecommendations
      ].join('\n\n');
      
      // Insertar en base de datos
      const [result] = await db.execute(`
        INSERT INTO medical_histories (
          patient_id, doctor_id, appointment_id, symptoms, current_illness,
          personal_history, family_history, surgical_history, physical_exam,
          vital_signs, occupational_assessment, diagnosis, cie10_code, treatment, medications,
          recommendations, next_appointment_date, notes, aptitude_status, restrictions, verification_code, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        data.patient_id,
        data.doctor_id,
        data.appointment_id || null,
        data.symptoms,
        data.current_illness || null,
        data.personal_history || null,
        data.family_history || null,
        data.surgical_history || null,
        data.physical_exam || null,
        JSON.stringify(data.vital_signs) || null,
        JSON.stringify(data.occupational_assessment) || null,
        data.diagnosis,
        data.cie10_code || null,
        data.treatment,
        data.medications || null,
        finalRecommendations || null,
        data.next_appointment_date || null,
        data.notes || null,
        data.aptitude_status || null,
        data.restrictions || null,
        verificationCode
      ]);
      
      const medicalHistoryId = (result as any).insertId;
      
      return {
        success: true,
        message: 'Historia médica ocupacional creada exitosamente',
        medical_history: {
          id: medicalHistoryId,
          ...data,
          recommendations: finalRecommendations
        },
        calculated_data: calculatedData
      };
      
    } catch (error) {
      console.error('Error creando historia médica:', error);
      return {
        success: false,
        message: 'Error al crear la historia médica'
      };
    }
  }
  
  // Obtener historias médicas de un paciente
  static async getPatientMedicalHistories(patientId: number): Promise<{
    success: boolean;
    data?: any[];
    message?: string;
  }> {
    try {
      const [rows] = await db.execute(`
        SELECT 
          mh.*,
          u.name as doctor_name,
          p.name as patient_name,
          a.appointment_date,
          a.appointment_type
        FROM medical_histories mh
        LEFT JOIN users u ON mh.doctor_id = u.id
        LEFT JOIN patients p ON mh.patient_id = p.id
        LEFT JOIN appointments a ON mh.appointment_id = a.id
        WHERE mh.patient_id = ?
        ORDER BY mh.created_at DESC
      `, [patientId]);
      
      return {
        success: true,
        data: rows as any[]
      };
      
    } catch (error) {
      console.error('Error obteniendo historias médicas:', error);
      return {
        success: false,
        message: 'Error al obtener las historias médicas'
      };
    }
  }
  
  // Obtener una historia médica específica
  static async getMedicalHistoryById(id: number): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const [rows] = await db.execute(`
        SELECT 
          mh.*,
          u.name as doctor_name,
          u.specialization as doctor_specialization,
          u.professional_license as doctor_professional_license,
          u.signature_path as doctor_signature_path,
          u.document_number as doctor_document_number,
          p.name as patient_name,
          p.date_of_birth as patient_birth_date,
          p.gender as patient_gender,
          a.appointment_date,
          a.appointment_type
        FROM medical_histories mh
        LEFT JOIN users u ON mh.doctor_id = u.id
        LEFT JOIN patients p ON mh.patient_id = p.id
        LEFT JOIN appointments a ON mh.appointment_id = a.id
        WHERE mh.id = ?
      `, [id]);
      
      if ((rows as any[]).length === 0) {
        return {
          success: false,
          message: 'Historia médica no encontrada'
        };
      }
      
      const history = (rows as any[])[0];
      
      // Parsear signos vitales si existen
      if (history.vital_signs) {
        try {
          history.vital_signs = JSON.parse(history.vital_signs);
        } catch (e) {
          console.error('Error parseando signos vitales:', e);
        }
      }
      
      return {
        success: true,
        data: history
      };
      
    } catch (error) {
      console.error('Error obteniendo historia médica:', error);
      return {
        success: false,
        message: 'Error al obtener la historia médica'
      };
    }
  }
  
  // Actualizar historia médica
  static async updateMedicalHistory(id: number, data: Partial<MedicalHistoryData>): Promise<{
    success: boolean;
    message: string;
    medical_history?: any;
  }> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      
      if (data.symptoms !== undefined) {
        setClause.push('symptoms = ?');
        values.push(data.symptoms);
      }
      
      if (data.current_illness !== undefined) {
        setClause.push('current_illness = ?');
        values.push(data.current_illness);
      }
      
      if (data.personal_history !== undefined) {
        setClause.push('personal_history = ?');
        values.push(data.personal_history);
      }
      
      if (data.family_history !== undefined) {
        setClause.push('family_history = ?');
        values.push(data.family_history);
      }
      
      if (data.surgical_history !== undefined) {
        setClause.push('surgical_history = ?');
        values.push(data.surgical_history);
      }
      
      if (data.physical_exam !== undefined) {
        setClause.push('physical_exam = ?');
        values.push(data.physical_exam);
      }
      
      if (data.vital_signs !== undefined) {
        setClause.push('vital_signs = ?');
        values.push(JSON.stringify(data.vital_signs));
      }
      
      if (data.diagnosis !== undefined) {
        setClause.push('diagnosis = ?');
        values.push(data.diagnosis);
      }
      
      if (data.cie10_code !== undefined) {
        setClause.push('cie10_code = ?');
        values.push(data.cie10_code);
      }
      
      if (data.treatment !== undefined) {
        setClause.push('treatment = ?');
        values.push(data.treatment);
      }
      
      if (data.medications !== undefined) {
        setClause.push('medications = ?');
        values.push(data.medications);
      }
      
      if (data.recommendations !== undefined) {
        setClause.push('recommendations = ?');
        values.push(data.recommendations);
      }
      
      if (data.next_appointment_date !== undefined) {
        setClause.push('next_appointment_date = ?');
        values.push(data.next_appointment_date);
      }
      
      if (data.notes !== undefined) {
        setClause.push('notes = ?');
        values.push(data.notes);
      }

      if (data.aptitude_status !== undefined) {
        setClause.push('aptitude_status = ?');
        values.push(data.aptitude_status);
      }

      if (data.restrictions !== undefined) {
        setClause.push('restrictions = ?');
        values.push(data.restrictions);
      }
      
      if (setClause.length === 0) {
        return {
          success: false,
          message: 'No hay datos para actualizar'
        };
      }
      
      setClause.push('updated_at = NOW()');
      values.push(id);
      
      await db.execute(
        `UPDATE medical_histories SET ${setClause.join(', ')} WHERE id = ?`,
        values
      );
      
      // Obtener la historia médica actualizada
      const updatedHistory = await this.getMedicalHistoryById(id);
      
      return {
        success: true,
        message: 'Historia médica actualizada exitosamente',
        medical_history: updatedHistory.data
      };
      
    } catch (error) {
      console.error('Error actualizando historia médica:', error);
      return {
        success: false,
        message: 'Error al actualizar la historia médica'
      };
    }
  }

  private static resolvePublicPath(relativePath: string): string {
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }

    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

    const possiblePaths = [
      path.join(process.cwd(), cleanPath),
      path.join(process.cwd(), 'dist', 'client', cleanPath),
      path.join(process.cwd(), 'public', cleanPath),
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
    }

    return possiblePaths[0];
  }

  private static async convertImageForPDF(imagePath: string): Promise<Buffer | null> {
    try {
      let inputBuffer: Buffer;

      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          const response = await fetch(imagePath);
          if (!response.ok) return null;
          const arrayBuffer = await response.arrayBuffer();
          inputBuffer = Buffer.from(arrayBuffer);
      } else {
          if (!fs.existsSync(imagePath)) return null;
          inputBuffer = fs.readFileSync(imagePath);
      }

      return await sharp(inputBuffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Error converting image:', error);
      return null;
    }
  }

  static async renderPDF(historyId: number): Promise<Buffer> {
    const result = await this.getMedicalHistoryById(historyId);
    if (!result.success || !result.data) {
      throw new Error('Medical history not found');
    }
    
    const history = result.data;
    const patient = await CertificateService.getPatientSummary(history.patient_id);
    const doctor = await CertificateService.getDoctorSummary(history.doctor_id);
    
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    
    return await new Promise(async (resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
      
      // Header
      const headerHeight = 70;
      const headerWidth = doc.page.width;
      
      doc.rect(0, 0, headerWidth, headerHeight).fill('#1e3a8a');
      
      doc.fillColor('#FFFFFF');
      doc.font('Helvetica-Bold').fontSize(14).text(cleanText('SISTEMA DE SALUD OCUPACIONAL'), 0, 20, { align: 'center', width: headerWidth });
      doc.fontSize(16).text(cleanText('HISTORIA CLÍNICA OCUPACIONAL'), 0, 40, { align: 'center', width: headerWidth });
      
      doc.fillColor('#000000');
      doc.y = headerHeight + 20;
      
      const contentWidth = doc.page.width - 100;
      const pageWidth = doc.page.width - 100;
      
      // Info Box
      const infoBoxY = doc.y;
      doc.rect(50, infoBoxY, pageWidth, 40).fill('#f1f5f9').stroke('#cbd5e1');
      doc.fillColor('#1e293b');
      
      doc.y = infoBoxY + 12;
      
      doc.font('Helvetica-Bold').fontSize(9).text(cleanText('FECHA DE CONSULTA:'), 70, doc.y);
      // Usar fecha de la cita si existe, de lo contrario la fecha de creación
      const consultationDate = history.appointment_date || history.created_at;
      doc.font('Helvetica').fontSize(10).text(cleanText(dayjs(consultationDate).format('DD/MM/YYYY HH:mm')), 180, doc.y);
      
      if (history.appointment_type) {
         doc.font('Helvetica-Bold').fontSize(9).text(cleanText('TIPO DE CONSULTA:'), 300, doc.y);
         doc.font('Helvetica').fontSize(10).text(cleanText(history.appointment_type.replace('_', ' ').toUpperCase()), 400, doc.y);
      }
      
      doc.y = infoBoxY + 50;
      
      // Patient Data
      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('DATOS DEL PACIENTE'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.2);
      
      const patientTableY = doc.y;
      const colWidth = contentWidth / 2;
      
      doc.rect(50, patientTableY, contentWidth, 55).fill('#f8f9fa').stroke('#e9ecef');
      doc.fillColor('#000000');
      
      // Left Column
      doc.font('Helvetica-Bold').fontSize(8).text(cleanText('Nombre:'), 60, patientTableY + 10);
      doc.font('Helvetica').text(cleanText(patient.name), 110, patientTableY + 10);
      
      doc.font('Helvetica-Bold').text(cleanText('Documento:'), 60, patientTableY + 25);
      doc.font('Helvetica').text(cleanText(`${patient.document_type || ''} ${patient.document_number || ''}`), 130, patientTableY + 25);
      
      doc.font('Helvetica-Bold').text(cleanText('Fecha Nac:'), 60, patientTableY + 40);
      doc.font('Helvetica').text(cleanText(patient.date_of_birth ? dayjs(patient.date_of_birth).format('DD/MM/YYYY') : 'N/A'), 120, patientTableY + 40);

      // Right Column
      const col2X = 50 + colWidth + 10;
      doc.font('Helvetica-Bold').text(cleanText('Empresa:'), col2X, patientTableY + 10);
      doc.font('Helvetica').text(cleanText(patient.company || 'N/A'), col2X + 60, patientTableY + 10);
      
      doc.font('Helvetica-Bold').text(cleanText('Ocupación:'), col2X, patientTableY + 25);
      doc.font('Helvetica').text(cleanText(patient.occupation || 'N/A'), col2X + 70, patientTableY + 25);
      
      doc.y = patientTableY + 65;
      
      // Anamnesis
      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('ANAMNESIS'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').fontSize(9).text(cleanText('Motivo de Consulta:'), 50, doc.y);
      doc.font('Helvetica').fontSize(9).text(cleanText(history.symptoms), 50, doc.y + 12, { width: contentWidth, align: 'justify' });
      doc.moveDown(1);
      
      if (history.current_illness) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(9).text(cleanText('Enfermedad Actual:'), 50, doc.y);
        doc.font('Helvetica').fontSize(9).text(cleanText(history.current_illness), 50, doc.y + 12, { width: contentWidth, align: 'justify' });
        doc.moveDown(1);
      }

      // Backgrounds
      if (history.personal_history || history.family_history || history.surgical_history) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(10).text(cleanText('ANTECEDENTES'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
        doc.moveDown(0.5);
        
        if (history.personal_history) {
            doc.font('Helvetica-Bold').fontSize(9).text(cleanText('Personales:'), 50, doc.y);
            doc.font('Helvetica').fontSize(9).text(cleanText(history.personal_history), 110, doc.y, { width: contentWidth - 60, align: 'justify' });
            doc.moveDown(0.5);
        }
        
        if (history.family_history) {
            doc.font('Helvetica-Bold').fontSize(9).text(cleanText('Familiares:'), 50, doc.y);
            doc.font('Helvetica').fontSize(9).text(cleanText(history.family_history), 110, doc.y, { width: contentWidth - 60, align: 'justify' });
            doc.moveDown(0.5);
        }
        
        if (history.surgical_history) {
            doc.font('Helvetica-Bold').fontSize(9).text(cleanText('Quirúrgicos:'), 50, doc.y);
            doc.font('Helvetica').fontSize(9).text(cleanText(history.surgical_history), 110, doc.y, { width: contentWidth - 60, align: 'justify' });
            doc.moveDown(0.5);
        }
      }
      
      // Physical Exam
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('EXAMEN FÍSICO'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.5);
      
      // Vital Signs
      if (history.vital_signs) {
        const vs = typeof history.vital_signs === 'string' ? JSON.parse(history.vital_signs) : history.vital_signs;
        
        doc.rect(50, doc.y, contentWidth, 25).fill('#e0f2fe');
        doc.fillColor('#000000');
        
        const startY = doc.y + 8;
        let currentX = 60;
        
        if (vs.systolic_pressure) {
            doc.font('Helvetica-Bold').fontSize(8).text('TA:', currentX, startY);
            doc.font('Helvetica').text(`${vs.systolic_pressure}/${vs.diastolic_pressure}`, currentX + 20, startY);
            currentX += 80;
        }
        
        if (vs.heart_rate) {
            doc.font('Helvetica-Bold').text('FC:', currentX, startY);
            doc.font('Helvetica').text(`${vs.heart_rate} lpm`, currentX + 20, startY);
            currentX += 80;
        }
        
        if (vs.weight && vs.height) {
            doc.font('Helvetica-Bold').text('Peso:', currentX, startY);
            doc.font('Helvetica').text(`${vs.weight} kg`, currentX + 25, startY);
            currentX += 70;
            
            doc.font('Helvetica-Bold').text('Talla:', currentX, startY);
            doc.font('Helvetica').text(`${vs.height} cm`, currentX + 25, startY);
            currentX += 70;
            
            const bmi = (vs.weight / Math.pow(vs.height/100, 2)).toFixed(1);
            doc.font('Helvetica-Bold').text('IMC:', currentX, startY);
            doc.font('Helvetica').text(bmi, currentX + 20, startY);
        }
        
        doc.y += 35;
      }
      
      if (history.physical_exam) {
        doc.font('Helvetica-Bold').fontSize(9).text(cleanText('Hallazgos:'), 50, doc.y);
        doc.font('Helvetica').fontSize(9).text(cleanText(history.physical_exam), 50, doc.y + 12, { width: contentWidth, align: 'justify' });
        doc.moveDown(1);
      }
      
      // Diagnosis
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('DIAGNÓSTICO'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.5);
      
      doc.rect(50, doc.y, contentWidth, 30).fill('#dcfce7');
      doc.fillColor('#000000');
      
      if (history.cie10_code) {
         doc.font('Helvetica-Bold').fontSize(9).text(cleanText(`CIE-10: ${history.cie10_code}`), 60, doc.y + 8);
      }
      doc.font('Helvetica').fontSize(9).text(cleanText(history.diagnosis), 60, doc.y + 20, { width: contentWidth - 20 });
      doc.y += 40;
      
      // Plan / Treatment
      doc.font('Helvetica-Bold').fontSize(10).text(cleanText('PLAN Y TRATAMIENTO'), 50, doc.y, { width: contentWidth, align: 'left', underline: true });
      doc.moveDown(0.5);
      
      if (history.treatment) {
        doc.font('Helvetica-Bold').fontSize(9).text(cleanText('Tratamiento:'), 50, doc.y);
        doc.font('Helvetica').fontSize(9).text(cleanText(history.treatment), 50, doc.y + 12, { width: contentWidth, align: 'justify' });
        doc.moveDown(1);
      }
      
      if (history.medications) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(9).text(cleanText('Medicamentos:'), 50, doc.y);
        doc.font('Helvetica').fontSize(9).text(cleanText(history.medications), 50, doc.y + 12, { width: contentWidth, align: 'justify' });
        doc.moveDown(1);
      }
      
      if (history.recommendations) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(9).text(cleanText('Recomendaciones:'), 50, doc.y);
        doc.font('Helvetica').fontSize(9).text(cleanText(history.recommendations), 50, doc.y + 12, { width: contentWidth, align: 'justify' });
        doc.moveDown(1);
      }
      
      // Signatures
      doc.moveDown(2);
      const signatureY = doc.y + 30;
      
      // Doctor Signature
      if (doctor.signature_path) {
         try {
           const signBuffer = await this.convertImageForPDF(this.resolvePublicPath(doctor.signature_path));
           if (signBuffer) {
              doc.image(signBuffer, 60, signatureY - 10, { width: 150, height: 40, align: 'left' });
              doc.text(cleanText(doctor.name), 60, signatureY + 35);
              doc.text(cleanText(`C.C. ${doctor.document_number || ''}`), 60, signatureY + 48);
              doc.text(cleanText(`Reg: ${doctor.professional_license || ''}`), 60, signatureY + 61);
           } else {
              doc.text('____________________________', 60, signatureY);
              doc.text(cleanText(doctor.name), 60, signatureY + 15);
              doc.text(cleanText(`C.C. ${doctor.document_number || ''}`), 60, signatureY + 28);
              doc.text(cleanText(`Reg: ${doctor.professional_license || ''}`), 60, signatureY + 41);
           }
         } catch (e) {
            doc.text('____________________________', 60, signatureY);
            doc.text(cleanText(doctor.name), 60, signatureY + 15);
            doc.text(cleanText(`C.C. ${doctor.document_number || ''}`), 60, signatureY + 28);
            doc.text(cleanText(`Reg: ${doctor.professional_license || ''}`), 60, signatureY + 41);
         }
      } else {
         doc.text('____________________________', 60, signatureY);
         doc.text(cleanText(doctor.name), 60, signatureY + 15);
         doc.text(cleanText(`C.C. ${doctor.document_number || ''}`), 60, signatureY + 28);
         doc.text(cleanText(`Reg: ${doctor.professional_license || ''}`), 60, signatureY + 41);
      }
      
      // Patient Signature
      const rightSigX = doc.page.width - 250;
      if (patient.signature_path) {
         try {
           const signBuffer = await this.convertImageForPDF(this.resolvePublicPath(patient.signature_path));
           if (signBuffer) {
              doc.image(signBuffer, rightSigX, signatureY - 10, { width: 150, height: 40, align: 'left' });
              doc.text(cleanText(patient.name), rightSigX, signatureY + 35);
              doc.text(cleanText(`C.C. ${patient.document_number || ''}`), rightSigX, signatureY + 48);
              doc.text('Paciente', rightSigX, signatureY + 61);
           } else {
              doc.text('____________________________', rightSigX, signatureY);
              doc.text(cleanText(patient.name), rightSigX, signatureY + 15);
              doc.text(cleanText(`C.C. ${patient.document_number || ''}`), rightSigX, signatureY + 28);
              doc.text('Paciente', rightSigX, signatureY + 41);
           }
         } catch (e) {
            doc.text('____________________________', rightSigX, signatureY);
            doc.text(cleanText(patient.name), rightSigX, signatureY + 15);
            doc.text(cleanText(`C.C. ${patient.document_number || ''}`), rightSigX, signatureY + 28);
            doc.text('Paciente', rightSigX, signatureY + 41);
         }
      } else {
         doc.text('____________________________', rightSigX, signatureY);
         doc.text(cleanText(patient.name), rightSigX, signatureY + 15);
         doc.text(cleanText(`C.C. ${patient.document_number || ''}`), rightSigX, signatureY + 28);
         doc.text('Paciente', rightSigX, signatureY + 41);
      }

      // Footer Note (Confidentiality Warning) - Always after signatures
      const footerY = signatureY + 80;
      doc.font('Helvetica').fontSize(6).text(cleanText(footerNote()), 50, footerY, { align: 'center', width: contentWidth });
      
      doc.end();
    });
  }
}
