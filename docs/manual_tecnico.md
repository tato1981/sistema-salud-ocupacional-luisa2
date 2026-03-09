# Manual Técnico - Sistema de Salud Ocupacional

Este documento describe la arquitectura, instalación y configuración técnica del sistema.

## 1. Stack Tecnológico

El proyecto está construido utilizando las siguientes tecnologías:

- **Frontend & Framework:** [Astro](https://astro.build/) (v5.16)
- **Lenguaje:** TypeScript / JavaScript (Node.js)
- **Estilos:** Tailwind CSS
- **Base de Datos:** MySQL
- **ORM / Driver:** mysql2 (Consultas SQL directas)
- **Autenticación:** JWT (JSON Web Tokens) + Bcrypt
- **Generación de PDF:** PDFKit
- **Procesamiento de Imágenes:** Sharp

## 2. Requisitos Previos

Antes de instalar el sistema, asegúrese de tener instalado:

- **Node.js**: Versión 18.x o superior.
- **MySQL**: Versión 8.0 o superior (o MariaDB equivalente).
- **Git**: Para el control de versiones.

## 3. Estructura del Proyecto

```
occupational-health-system/
├── database/           # Scripts SQL y de inicialización
├── public/
│   └── uploads/        # Almacenamiento de imágenes de pacientes y firmas (Desarrollo)
├── src/
│   ├── components/     # Componentes UI reutilizables (Astro)
│   ├── layouts/        # Plantillas de diseño (Dashboard, Auth)
│   ├── lib/            # Lógica de negocio y utilidades (DB, Auth, Services)
│   ├── pages/          # Rutas del sistema (File-based routing)
│   │   ├── admin/      # Rutas protegidas para administradores
│   │   ├── api/        # Endpoints de la API (Backend)
│   │   └── ...         # Otras rutas por rol
│   └── middleware.ts   # Protección de rutas y verificación de sesión
├── .env                # Variables de entorno
├── astro.config.mjs    # Configuración de Astro (Adapter: Node)
└── package.json        # Dependencias y scripts
```

## 4. Instalación y Configuración

### Paso 1: Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd occupational-health-system
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar Base de Datos
1. Cree una base de datos en MySQL (ej. `occupational_health`).
2. El sistema se conecta utilizando las credenciales definidas en el archivo `.env`.

### Paso 4: Variables de Entorno
Cree un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=occupational_health
JWT_SECRET=tu_secreto_seguro_jwt_generado_aleatoriamente
```

### Paso 5: Ejecutar en Desarrollo
```bash
npm run dev
```
El sistema estará disponible en `http://localhost:4321`.

## 5. Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila el proyecto para producción (genera servidor Node.js independiente).
- `npm run preview`: Vista previa de la build de producción.
- `npm run optimize-images`: Ejecuta script de optimización de imágenes almacenadas.
- `npm run cleanup-images`: Limpia imágenes temporales o no utilizadas.

## 6. Despliegue (Producción)

El proyecto utiliza el adaptador `@astrojs/node` en modo `standalone`.

1. **Construir el proyecto:**
   ```bash
   npm run build
   ```
   Esto generará una carpeta `dist/` con el servidor y los archivos estáticos.

2. **Ejecutar el servidor:**
   ```bash
   node dist/server/entry.mjs
   ```

3. **Variables de Entorno en Producción:**
   Asegúrese de configurar las variables de entorno en su servidor de hosting o contenedor Docker.

4. **Persistencia de Archivos:**
   El sistema almacena imágenes en la carpeta `uploads/`. En producción, esta carpeta debe ser persistente.
   - El sistema buscará archivos subidos en `./uploads/` (relativo a la raíz de ejecución) o `./dist/client/uploads/`.
   - Se recomienda montar un volumen externo en `/app/uploads` si usa Docker.

## 7. Arquitectura de Base de Datos

El sistema utiliza tablas relacionales clave:

- **users:** Almacena credenciales y roles (admin, doctor, staff, company).
- **patients:** Información demográfica y laboral de los pacientes.
- **companies:** Datos de las empresas clientes.
- **exam_requests:** Solicitudes de examen vinculando Empresa -> Paciente.
- **appointments:** Citas médicas agendadas vinculando Solicitud -> Doctor.
- **medical_history:** Registro clínico detallado.
