
import { db } from '../src/lib/database';
import { PatientService } from '../src/lib/patient-service';
import { MedicalHistoryService } from '../src/lib/medical-history-service';

const DOCTOR_ID = 31;
const CREATED_BY = 36;

const firstNames = ['Juan', 'Maria', 'Pedro', 'Ana', 'Luis', 'Carmen', 'Jose', 'Laura', 'Carlos', 'Sofia', 'Miguel', 'Isabella', 'Javier', 'Valentina', 'Andres'];
const lastNames = ['Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Reyes'];
const occupations = ['Ingeniero', 'Abogado', 'Medico', 'Profesor', 'Arquitecto', 'Contador', 'Enfermero', 'Policia', 'Bombero', 'Carpintero', 'Electricista', 'Mecanico', 'Conductor', 'Vendedor', 'Estudiante'];
const companies = ['TechSol', 'Construcciones SA', 'Hospital Central', 'Escuela Nacional', 'Diseños Modernos', 'Contadores Asociados', 'Clinica San Jose', 'Seguridad Privada', 'Bomberos Voluntarios', 'Muebles Finos', 'Electricidad Total', 'Taller Mecanico', 'Transportes Rapidos', 'Ventas Globales', 'Universidad Estatal'];

function getRandomElement(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  console.log('Starting seed...');

  for (let i = 0; i < 15; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const documentNumber = `1000${getRandomNumber(100000, 999999)}`;
    
    const patientData = {
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomNumber(1, 999)}@example.com`,
      phone: `300${getRandomNumber(1000000, 9999999)}`,
      documentType: 'cedula',
      documentNumber: documentNumber,
      dateOfBirth: getRandomDate(new Date(1970, 0, 1), new Date(2000, 0, 1)),
      gender: Math.random() > 0.5 ? 'masculino' : 'femenino',
      address: `Calle ${getRandomNumber(1, 100)} #${getRandomNumber(1, 100)}-${getRandomNumber(1, 100)}`,
      occupation: getRandomElement(occupations),
      company: getRandomElement(companies),
      companyId: null,
      createdBy: CREATED_BY
    };

    try {
      console.log(`Creating patient ${i + 1}/15: ${fullName}`);
      const patientResult = await PatientService.createPatient(patientData);

      if (!patientResult.success) {
        console.error(`Failed to create patient ${fullName}: ${patientResult.message}`);
        continue;
      }

      // We need to get the patient ID. 
      // The createPatient method returns { success: boolean; message: string; patient?: any }
      // but let's check if it returns the ID or the full patient object.
      // Looking at the code in PatientService.createPatient:
      // It returns: return { success: true, message: 'Paciente creado exitosamente', patient: { id: insertId, ... } };
      
      const patientId = patientResult.patient.id;

      // Create Medical History
      const medicalHistoryData = {
        patient_id: patientId,
        doctor_id: DOCTOR_ID,
        symptoms: 'Examen de ingreso ocupacional',
        diagnosis: 'Apto para laborar',
        treatment: 'Ninguno',
        vital_signs: {
          systolic_pressure: getRandomNumber(110, 130),
          diastolic_pressure: getRandomNumber(70, 85),
          heart_rate: getRandomNumber(60, 90),
          respiratory_rate: getRandomNumber(12, 20),
          temperature: 36.5 + Math.random(),
          oxygen_saturation: getRandomNumber(95, 99),
          height: getRandomNumber(160, 185),
          weight: getRandomNumber(60, 90),
        },
        occupational_assessment: {
          work_environment_risk: 'Bajo',
          physical_capacity: 'normal',
          fitness_for_work: 'apto',
        },
        aptitude_status: 'apto',
        recommendations: 'Uso de EPP según cargo.'
      };

      // Cast to any to bypass strict type checking if interfaces don't match exactly 
      // (though they should based on what I read)
      const historyResult = await MedicalHistoryService.createMedicalHistory(medicalHistoryData as any);
      
      if (historyResult.success) {
         console.log(`Created medical history for patient ${fullName}`);
      } else {
         console.error(`Failed to create medical history for ${fullName}: ${historyResult.message}`);
      }

    } catch (error) {
      console.error(`Error processing ${fullName}:`, error);
    }
  }

  console.log('Seed completed.');
  process.exit(0);
}

seed();
