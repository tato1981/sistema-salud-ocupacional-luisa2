# Manual de Usuario - Sistema de Salud Ocupacional

Bienvenido al manual de usuario del Sistema de Salud Ocupacional. Este sistema permite gestionar integralmente el proceso de medicina laboral, desde la solicitud de exámenes por parte de las empresas hasta la emisión de certificados de aptitud.

## Tabla de Contenidos
1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Roles de Usuario](#2-roles-de-usuario)
3. [Módulo de Administrador y Staff](#3-módulo-de-administrador-y-staff)
4. [Módulo de Empresa](#4-módulo-de-empresa)
5. [Módulo de Médico](#5-módulo-de-médico)
6. [Módulo de Paciente](#6-módulo-de-paciente)
7. [Verificación de Certificados](#7-verificación-de-certificados)

---

## 1. Acceso al Sistema

### Iniciar Sesión
1. Diríjase a la página principal del sistema.
2. Ingrese su **Correo Electrónico** y **Contraseña**.
3. Haga clic en **Iniciar Sesión**.

### Registro
- El registro está restringido mediante **Códigos de Invitación**.
- Si usted representa a una Empresa o es un Médico nuevo, solicite un código al administrador.
- Haga clic en "¿No tienes cuenta? Regístrate aquí" e ingrese el código proporcionado.

### Recuperar Contraseña
- Si olvidó su clave, use la opción "¿Olvidaste tu contraseña?" en la pantalla de login.

---

## 2. Roles de Usuario

El sistema cuenta con 5 roles principales, cada uno con permisos específicos:

| Rol | Descripción |
| :--- | :--- |
| **Admin** | Control total del sistema. Gestiona usuarios, empresas y configuraciones. |
| **Staff** | Personal administrativo de apoyo. Gestiona citas, pacientes y solicitudes. |
| **Empresa** | Clientes que solicitan exámenes para sus empleados. |
| **Doctor** | Profesionales de salud que realizan las evaluaciones médicas. |
| **Paciente** | Empleados que pueden consultar sus propios resultados e historial. |

---

## 3. Módulo de Administrador y Staff

Este módulo es el centro de operaciones de la clínica.

### 3.1 Gestión de Solicitudes
- **Ver Solicitudes:** En la sección "Solicitudes", verá todas las peticiones de examen enviadas por las empresas.
- **Asignar Cita:** Puede agendar una cita directamente desde una solicitud, asignando fecha, hora y doctor.
- **Estados:** Monitoree el estado (Pendiente, Agendada, Completada).

### 3.2 Gestión de Pacientes
- **Registro:** Puede crear pacientes manualmente si llegan sin solicitud previa de empresa.
- **Datos:** Edite información personal, foto de perfil y firma digital del paciente.

### 3.3 Gestión de Citas (Agenda)
- **Listado:** Vista general de todas las citas programadas.
- **Monitoreo:** Panel en tiempo real para ver pacientes en sala de espera, en consulta y atendidos.
- **Nueva Cita:** Agende citas seleccionando paciente, doctor, fecha y hora.

### 3.4 Administración (Solo Admin)
- **Empresas:** Registre y gestione las empresas clientes.
- **Doctores:** Cree cuentas para el personal médico.
- **Códigos:** Genere códigos de invitación para auto-registro de empresas y doctores.

---

## 4. Módulo de Empresa

Diseñado para que los clientes gestionen la salud ocupacional de su personal.

### 4.1 Solicitar Examen
1. Vaya a "Solicitar Examen".
2. Seleccione un empleado existente o registre uno nuevo.
3. Elija el tipo de examen (Ingreso, Periódico, Retiro, etc.).
4. Envíe la solicitud. La clínica se encargará de agendar la cita.

### 4.2 Gestión de Empleados
- Mantenga actualizada la base de datos de sus empleados.
- Vea el historial de exámenes de cada trabajador.

### 4.3 Descarga de Certificados
- Una vez el médico complete la evaluación, podrá descargar el **Certificado de Aptitud** desde la sección de "Solicitudes" o "Empleados".

---

## 5. Módulo de Médico

Interfaz clínica para la realización de evaluaciones.

### 5.1 Mis Citas
- Vea su agenda diaria.
- Identifique qué pacientes están listos para ser atendidos.

### 5.2 Historia Clínica
- Al iniciar una atención, se abrirá el formulario de Historia Clínica.
- **Secciones:** Antecedentes, Examen Físico, Concepto Médico.
- **Validación:** El sistema valida que todos los campos obligatorios estén llenos.

### 5.3 Finalización
- Al guardar la historia, se genera automáticamente el Certificado de Aptitud.
- El estado de la cita cambia a "Completada".

---

## 6. Módulo de Paciente

Portal de autogestión para el trabajador.

- **Mis Consultas:** Vea el historial de todas sus visitas a la clínica.
- **Perfil:** Actualice sus datos de contacto.
- **Certificados:** Descargue sus propios certificados de aptitud si la empresa lo permite.

---

## 7. Verificación de Certificados

El sistema incluye un módulo público para validar la autenticidad de los documentos emitidos.

1. Escanee el código QR impreso en el certificado O vaya a `/certificates/verify`.
2. Ingrese el código alfanumérico único del certificado.
3. El sistema le confirmará si el documento es válido y mostrará los datos básicos (Nombre, Fecha, Concepto) para cotejar.
