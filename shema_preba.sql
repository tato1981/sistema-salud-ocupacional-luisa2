CREATE DATABASE  IF NOT EXISTS `occupational_health` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `occupational_health`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: occupational_health
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `appointment_summary`
--

DROP TABLE IF EXISTS `appointment_summary`;
/*!50001 DROP VIEW IF EXISTS `appointment_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `appointment_summary` AS SELECT 
 1 AS `id`,
 1 AS `appointment_date`,
 1 AS `patient_name`,
 1 AS `identification_number`,
 1 AS `doctor_name`,
 1 AS `status`,
 1 AS `type`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `appointment_date` datetime NOT NULL,
  `duration_minutes` int DEFAULT '30',
  `appointment_type` varchar(100) DEFAULT NULL,
  `status` enum('programada','en_progreso','completada','cancelada','no_asistio') DEFAULT 'programada',
  `type` enum('consultation','follow_up','emergency','routine_check') DEFAULT 'consultation',
  `reason` text,
  `notes` text,
  `created_by_user_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_appointment_date` (`appointment_date`),
  KEY `idx_status` (`status`),
  KEY `idx_doctor_date` (`doctor_id`,`appointment_date`),
  KEY `idx_patient_date` (`patient_id`,`appointment_date`),
  KEY `idx_appointment_range` (`appointment_date`,`status`),
  KEY `created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_4` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (36,52,31,'2026-01-20 07:00:00',30,'examen_ingreso','completada','consultation','Ingreso',NULL,NULL,30,'2026-01-15 22:58:22','2026-01-15 23:03:31'),(37,53,31,'2026-01-20 14:00:00',30,'examen_periodico','completada','consultation','Solicitud de examen ocupacional',NULL,NULL,32,'2026-01-17 01:30:55','2026-01-17 04:22:16'),(38,53,31,'2026-01-19 17:36:00',30,'examen_ingreso','cancelada','consultation','Ingreso',NULL,NULL,32,'2026-01-17 05:02:00','2026-01-17 05:04:04'),(39,52,31,'2026-01-19 11:30:00',30,'consulta_general','completada','consultation','Consulta General',NULL,NULL,30,'2026-01-17 05:06:07','2026-01-17 05:08:45'),(40,52,31,'2026-01-17 12:30:00',30,'seguimiento','en_progreso','consultation',NULL,NULL,NULL,30,'2026-01-17 16:23:11','2026-01-17 16:23:21'),(41,53,31,'2026-03-01 07:30:00',30,'examen_periodico','programada','consultation','ingreso',NULL,NULL,30,'2026-03-05 14:07:30','2026-03-05 14:07:30'),(42,69,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:10','2026-03-07 00:55:10'),(43,70,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:10','2026-03-07 00:55:10'),(44,71,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(45,72,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(46,73,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(47,74,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(48,75,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(49,76,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(50,77,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(51,78,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(52,79,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(53,80,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(54,81,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(55,82,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(56,83,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(57,54,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(58,55,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(59,56,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(60,57,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11'),(61,58,31,'2026-03-07 00:55:10',30,'examen_ingreso','completada','consultation','Examen de Ingreso Ocupacional (Generado Automáticamente)',NULL,NULL,36,'2026-03-07 00:55:11','2026-03-07 00:55:11');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `nit` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `responsible_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (11,'Unidad Nacional de Protección','900.123.675-8','Calle 54 65-78 Bogotá','3145716188','Camila Perez','duberney22915@yahoo.com','active','2026-01-16 20:22:30');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_contacts`
--

DROP TABLE IF EXISTS `company_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_company` (`company_id`),
  CONSTRAINT `fk_company_contacts_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_contacts`
--

LOCK TABLES `company_contacts` WRITE;
/*!40000 ALTER TABLE `company_contacts` DISABLE KEYS */;
INSERT INTO `company_contacts` VALUES (5,11,'Camila Perez','duberney22915@yahoo.com',1,'2026-01-16 20:22:30');
/*!40000 ALTER TABLE `company_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_requests`
--

DROP TABLE IF EXISTS `exam_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_document` varchar(50) NOT NULL,
  `patient_document_type` enum('cedula','pasaporte','tarjeta_identidad','pep','ppt') NOT NULL DEFAULT 'cedula',
  `exam_type` enum('ingreso','periodico','retiro','post_incapacidad','reubicacion') NOT NULL,
  `position` varchar(100) NOT NULL,
  `status` enum('pending','scheduled','completed','cancelled','rejected') DEFAULT 'pending',
  `appointment_id` int DEFAULT NULL,
  `requested_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_exam_requests_user` (`requested_by`),
  KEY `fk_exam_requests_appointment` (`appointment_id`),
  KEY `idx_exam_requests_company` (`company_id`),
  KEY `idx_exam_requests_status` (`status`),
  KEY `idx_exam_requests_created_at` (`created_at`),
  CONSTRAINT `fk_exam_requests_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_exam_requests_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exam_requests_user` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_requests`
--

LOCK TABLES `exam_requests` WRITE;
/*!40000 ALTER TABLE `exam_requests` DISABLE KEYS */;
INSERT INTO `exam_requests` VALUES (15,11,'Andres Morales','565423243','cedula','periodico','Escolta','completed',NULL,34,'2026-01-17 01:30:17','2026-01-17 05:00:46');
/*!40000 ALTER TABLE `exam_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitation_codes`
--

DROP TABLE IF EXISTS `invitation_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitation_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` timestamp NULL DEFAULT NULL,
  `used_by` int DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `max_uses` int DEFAULT '1',
  `current_uses` int DEFAULT '0',
  `description` varchar(255) DEFAULT NULL,
  `assigned_role` enum('admin','staff','doctor','company','superadmin') NOT NULL DEFAULT 'staff',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `created_by` (`created_by`),
  KEY `used_by` (`used_by`),
  KEY `idx_code` (`code`),
  KEY `idx_email` (`email`),
  KEY `idx_active` (`is_active`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `invitation_codes_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invitation_codes_ibfk_2` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitation_codes`
--

LOCK TABLES `invitation_codes` WRITE;
/*!40000 ALTER TABLE `invitation_codes` DISABLE KEYS */;
INSERT INTO `invitation_codes` VALUES (27,'WA9H0JFK','duberney22915@gmail.com',32,'2026-03-07 00:23:24','2026-03-07 00:24:02',36,NULL,1,1,1,NULL,'admin');
/*!40000 ALTER TABLE `invitation_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_histories`
--

DROP TABLE IF EXISTS `medical_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `appointment_id` int DEFAULT NULL,
  `symptoms` text NOT NULL,
  `current_illness` text,
  `personal_history` text,
  `family_history` text,
  `surgical_history` text,
  `physical_exam` text,
  `vital_signs` json DEFAULT NULL,
  `diagnosis` text NOT NULL,
  `cie10_code` varchar(20) DEFAULT NULL,
  `treatment` text NOT NULL,
  `medications` text,
  `recommendations` text,
  `aptitude_status` enum('apto','apto_con_restricciones','apto_manipulacion_alimentos','apto_trabajo_alturas','apto_espacios_confinados','apto_conduccion') DEFAULT NULL,
  `verification_code` varchar(100) DEFAULT NULL,
  `next_appointment_date` date DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `restrictions` text,
  `occupational_assessment` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_cie10_code` (`cie10_code`),
  KEY `idx_medical_history_dates` (`patient_id`,`created_at`),
  KEY `idx_verification_code` (`verification_code`),
  CONSTRAINT `medical_histories_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medical_histories_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medical_histories_ibfk_3` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_histories`
--

LOCK TABLES `medical_histories` WRITE;
/*!40000 ALTER TABLE `medical_histories` DISABLE KEYS */;
INSERT INTO `medical_histories` VALUES (24,52,31,36,'Ingreso','Ninguna','No','NO','NO','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','\"{\\\"weight\\\":70,\\\"height\\\":176,\\\"systolic_pressure\\\":125,\\\"diastolic_pressure\\\":80,\\\"heart_rate\\\":72,\\\"temperature\\\":36,\\\"oxygen_saturation\\\":98}\"','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','z100','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','apto','38AAcfDSqA4Lig210WKO6GzRCuOEUaQB','2027-01-15','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','2026-01-15 23:02:58','2026-03-07 01:58:11','ninguna',NULL),(25,53,31,37,'Periodico','Ninguna','Ninguna','ninguna.','Ninguna.','Learn about the history, usage and variations of Lorem Ipsum, the industry\'s standard dummy text for over 2000 years. Generate your own Lorem Ipsum with a dictionary of over 200 Latin words','\"{\\\"weight\\\":76,\\\"height\\\":179,\\\"systolic_pressure\\\":120,\\\"diastolic_pressure\\\":85,\\\"heart_rate\\\":73,\\\"temperature\\\":35,\\\"oxygen_saturation\\\":99}\"','Learn about the history, usage and variations of Lorem Ipsum, the industry\'s standard dummy text for over 2000 years. Generate your own Lorem Ipsum with a dictionary of over 200 Latin words','Z10','Learn about the history, usage and variations of Lorem Ipsum, the industry\'s standard dummy text for over 2000 years. Generate your own Lorem Ipsum with a dictionary of over 200 Latin words','Learn about the history, usage and variations of Lorem Ipsum, the industry\'s standard dummy text for over 2000 years. Generate your own Lorem Ipsum with a dictionary of over 200 Latin words','Learn about the history, usage and variations of Lorem Ipsum, the industry\'s standard dummy text for over 2000 years. Generate your own Lorem Ipsum with a dictionary of over 200 Latin words','apto_espacios_confinados','oCg9EDKk8Z3yvkrQ8Lu3wgmJSBYx9pF2','2027-01-16','Learn about the history, usage and variations of Lorem Ipsum, the industry\'s standard dummy text for over 2000 years. Generate your own Lorem Ipsum with a dictionary of over 200 Latin words.','2026-01-17 03:33:28','2026-01-17 04:23:22','Ninguna',NULL),(26,52,31,39,'Consulta Medica','Ninguna','No','NO','NO','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','\"{\\\"weight\\\":72,\\\"height\\\":176,\\\"systolic_pressure\\\":125,\\\"diastolic_pressure\\\":85,\\\"heart_rate\\\":73,\\\"temperature\\\":36,\\\"oxygen_saturation\\\":87}\"','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','Z10','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','apto','vY9ZfUgYxNJ7t7hrYpzX2YZHxDi70XOj','2027-01-17','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','2026-01-17 05:08:01','2026-03-07 02:15:20','Ninguna',NULL),(27,52,31,40,'Seguimiento','Ninguna','No','NO','NO','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','\"{\\\"weight\\\":75,\\\"height\\\":170,\\\"systolic_pressure\\\":120,\\\"diastolic_pressure\\\":80,\\\"heart_rate\\\":71,\\\"temperature\\\":36,\\\"oxygen_saturation\\\":96}\"','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','z100','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ',NULL,'eZTNdfgFXCXHqb5Yw2BSbzFIImmEhHSw',NULL,'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias ','2026-01-17 16:24:39','2026-01-17 16:24:39',NULL,NULL),(28,54,31,57,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 29.4, \"height\": 168, \"weight\": 83, \"heart_rate\": 67, \"temperature\": 36.54379141699723, \"respiratory_rate\": 13, \"oxygen_saturation\": 98, \"systolic_pressure\": 118, \"diastolic_pressure\": 78}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (29.4)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','84bBsd2ekm0TRDYMQyNJrIVKd8tmIIIg',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(29,55,31,58,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 22.1, \"height\": 173, \"weight\": 66, \"heart_rate\": 61, \"temperature\": 37.442983512510835, \"respiratory_rate\": 20, \"oxygen_saturation\": 95, \"systolic_pressure\": 110, \"diastolic_pressure\": 77}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (22.1)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','GBb93vpIUa38hBJXJInG4DmqMVznqHKQ',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(30,56,31,59,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 28, \"height\": 168, \"weight\": 79, \"heart_rate\": 69, \"temperature\": 37.17179999178816, \"respiratory_rate\": 13, \"oxygen_saturation\": 96, \"systolic_pressure\": 115, \"diastolic_pressure\": 72}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (28)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','Rf6KCOn0yhHP3dGplMb2jwfS313QJqyJ',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(31,57,31,60,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 19.8, \"height\": 177, \"weight\": 62, \"heart_rate\": 63, \"temperature\": 36.53700194427685, \"respiratory_rate\": 19, \"oxygen_saturation\": 95, \"systolic_pressure\": 110, \"diastolic_pressure\": 75}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (19.8)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','WlC9k3SXNdN7GK0W9mTTjoYIsfRJfxk6',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(32,58,31,61,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 27.4, \"height\": 171, \"weight\": 80, \"heart_rate\": 62, \"temperature\": 36.809088687744925, \"respiratory_rate\": 16, \"oxygen_saturation\": 95, \"systolic_pressure\": 119, \"diastolic_pressure\": 85}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (27.4)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','YW2ssdpyr3c6XH6gFshmP4jrFHDnp0rw',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(33,59,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 29.7, \"height\": 161, \"weight\": 77, \"heart_rate\": 65, \"temperature\": 36.5644596128138, \"respiratory_rate\": 14, \"oxygen_saturation\": 99, \"systolic_pressure\": 118, \"diastolic_pressure\": 71}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (29.7)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','5znXArGuxN9CKVFpWrIJ3ysuDOrradlJ',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(34,60,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 30.1, \"height\": 160, \"weight\": 77, \"heart_rate\": 71, \"temperature\": 36.51212232949506, \"respiratory_rate\": 12, \"oxygen_saturation\": 96, \"systolic_pressure\": 125, \"diastolic_pressure\": 80}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Obesidad grado I (30.1)\n\nPérdida de peso estructurada (10-15%)\n\nIntervención nutricional intensiva\n\nPrograma de ejercicio supervisado\n\nEvaluación cardiovascular\n\nControl de diabetes e hipertensión\n\nSeguimiento médico mensual\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','jGWtu3fHwUzYSc9dYTqyAw2V9Sp6qIXS',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(35,61,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 21, \"height\": 169, \"weight\": 60, \"heart_rate\": 65, \"temperature\": 36.80362194141321, \"respiratory_rate\": 12, \"oxygen_saturation\": 98, \"systolic_pressure\": 123, \"diastolic_pressure\": 77}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (21)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial elevada\n\nModificaciones de estilo de vida\n\nControl cada 6 meses\n\nReducción de peso si es necesario\n\nLimitación de sodio (<2.3g/día)\n\nEjercicio aeróbico regular\n\nManejo del estrés laboral\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','4aOJ1iPFLOXdIlRFKeJfXke0acrpb9y6',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(36,62,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 26.7, \"height\": 172, \"weight\": 79, \"heart_rate\": 80, \"temperature\": 36.60044631773301, \"respiratory_rate\": 16, \"oxygen_saturation\": 99, \"systolic_pressure\": 115, \"diastolic_pressure\": 72}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (26.7)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','boi9YEIaq23tprN5qgbj4sw85iqWznVg',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(37,63,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 28.7, \"height\": 166, \"weight\": 79, \"heart_rate\": 81, \"temperature\": 36.57558498079114, \"respiratory_rate\": 16, \"oxygen_saturation\": 98, \"systolic_pressure\": 116, \"diastolic_pressure\": 81}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (28.7)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','3u1kknpUGxhFXSi5ta6liSBtEZdNhYu2',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(38,64,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 26.6, \"height\": 182, \"weight\": 88, \"heart_rate\": 89, \"temperature\": 36.90869509127696, \"respiratory_rate\": 16, \"oxygen_saturation\": 95, \"systolic_pressure\": 118, \"diastolic_pressure\": 77}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (26.6)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','Gq2XnCtCCM5htAloEIvTUDXxtoyrQ4Vg',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(39,65,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 30.5, \"height\": 166, \"weight\": 84, \"heart_rate\": 80, \"temperature\": 37.46719801870784, \"respiratory_rate\": 15, \"oxygen_saturation\": 96, \"systolic_pressure\": 118, \"diastolic_pressure\": 80}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Obesidad grado I (30.5)\n\nPérdida de peso estructurada (10-15%)\n\nIntervención nutricional intensiva\n\nPrograma de ejercicio supervisado\n\nEvaluación cardiovascular\n\nControl de diabetes e hipertensión\n\nSeguimiento médico mensual\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','eWK3SyjkqgbP56M2XbnZzIH6poEnvKMc',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(40,66,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 24.8, \"height\": 184, \"weight\": 84, \"heart_rate\": 88, \"temperature\": 36.95384221062342, \"respiratory_rate\": 17, \"oxygen_saturation\": 99, \"systolic_pressure\": 129, \"diastolic_pressure\": 80}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (24.8)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','Dkvq2mYf9Kqrf0RASt0fd0M5HiapFGXt',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(41,67,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 28.4, \"height\": 169, \"weight\": 81, \"heart_rate\": 70, \"temperature\": 36.78899454311053, \"respiratory_rate\": 20, \"oxygen_saturation\": 97, \"systolic_pressure\": 118, \"diastolic_pressure\": 70}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (28.4)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','LWPOmqKukLboFJurJyHhor2cywOcp7Di',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(42,68,31,NULL,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 34, \"height\": 160, \"weight\": 87, \"heart_rate\": 65, \"temperature\": 36.81978621425777, \"respiratory_rate\": 14, \"oxygen_saturation\": 95, \"systolic_pressure\": 111, \"diastolic_pressure\": 71}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Obesidad grado I (34)\n\nPérdida de peso estructurada (10-15%)\n\nIntervención nutricional intensiva\n\nPrograma de ejercicio supervisado\n\nEvaluación cardiovascular\n\nControl de diabetes e hipertensión\n\nSeguimiento médico mensual\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','vE0a25IW8xyhyXol2dCGUf8TZsi5NGjf',NULL,NULL,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(43,69,31,42,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 23.5, \"height\": 175, \"weight\": 72, \"heart_rate\": 86, \"temperature\": 37.36009833037475, \"respiratory_rate\": 18, \"oxygen_saturation\": 99, \"systolic_pressure\": 121, \"diastolic_pressure\": 75}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (23.5)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial elevada\n\nModificaciones de estilo de vida\n\nControl cada 6 meses\n\nReducción de peso si es necesario\n\nLimitación de sodio (<2.3g/día)\n\nEjercicio aeróbico regular\n\nManejo del estrés laboral\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','4rl8tb0CIH44FL6AIERkVziVtebkpDpA',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:10',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(44,70,31,43,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 30.1, \"height\": 167, \"weight\": 84, \"heart_rate\": 70, \"temperature\": 37.22803561330828, \"respiratory_rate\": 18, \"oxygen_saturation\": 96, \"systolic_pressure\": 127, \"diastolic_pressure\": 85}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Obesidad grado I (30.1)\n\nPérdida de peso estructurada (10-15%)\n\nIntervención nutricional intensiva\n\nPrograma de ejercicio supervisado\n\nEvaluación cardiovascular\n\nControl de diabetes e hipertensión\n\nSeguimiento médico mensual\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','1gAyqtzeJJHAYJv5O4VOEJqFq5gZ7OBI',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(45,71,31,44,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 20.2, \"height\": 182, \"weight\": 67, \"heart_rate\": 89, \"temperature\": 37.06696088427068, \"respiratory_rate\": 20, \"oxygen_saturation\": 96, \"systolic_pressure\": 121, \"diastolic_pressure\": 80}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (20.2)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','Iu3GmqJPaaO05UngnGuzTpRF4CofMXyT',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(46,72,31,45,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 23.9, \"height\": 183, \"weight\": 80, \"heart_rate\": 63, \"temperature\": 36.94753002202123, \"respiratory_rate\": 16, \"oxygen_saturation\": 98, \"systolic_pressure\": 120, \"diastolic_pressure\": 83}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (23.9)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','x2LcFKNiKZybnzEHhICd130d8h2sLdPQ',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(47,73,31,46,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 23.1, \"height\": 165, \"weight\": 63, \"heart_rate\": 67, \"temperature\": 36.72639589689156, \"respiratory_rate\": 15, \"oxygen_saturation\": 95, \"systolic_pressure\": 114, \"diastolic_pressure\": 80}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (23.1)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','ctuylYpCdZXw3qMoZlh1pUNaAsY7xNaN',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(48,74,31,47,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 22.1, \"height\": 173, \"weight\": 66, \"heart_rate\": 82, \"temperature\": 37.11145819790455, \"respiratory_rate\": 12, \"oxygen_saturation\": 96, \"systolic_pressure\": 130, \"diastolic_pressure\": 81}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (22.1)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','UnOuvEizCe9iOKOwaMq0zojwf2Afqehs',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(49,75,31,48,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 21.7, \"height\": 181, \"weight\": 71, \"heart_rate\": 67, \"temperature\": 37.162021138441915, \"respiratory_rate\": 14, \"oxygen_saturation\": 97, \"systolic_pressure\": 114, \"diastolic_pressure\": 74}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (21.7)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','lZIiUNboU0wrIZbQxNrxAFEHID9tVtAF',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(50,76,31,49,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 27.8, \"height\": 178, \"weight\": 88, \"heart_rate\": 76, \"temperature\": 36.68591691966369, \"respiratory_rate\": 16, \"oxygen_saturation\": 96, \"systolic_pressure\": 114, \"diastolic_pressure\": 81}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (27.8)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','Z5LGs55d0VQMupLRgCCzONgZB6YChlaH',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(51,77,31,50,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 29.1, \"height\": 171, \"weight\": 85, \"heart_rate\": 77, \"temperature\": 37.10060956009814, \"respiratory_rate\": 14, \"oxygen_saturation\": 99, \"systolic_pressure\": 120, \"diastolic_pressure\": 73}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (29.1)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial elevada\n\nModificaciones de estilo de vida\n\nControl cada 6 meses\n\nReducción de peso si es necesario\n\nLimitación de sodio (<2.3g/día)\n\nEjercicio aeróbico regular\n\nManejo del estrés laboral\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','rLDlOwPHJlSq9fLgAUj49CHeqwXguKhL',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(52,78,31,51,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 29, \"height\": 164, \"weight\": 78, \"heart_rate\": 78, \"temperature\": 36.70300495438465, \"respiratory_rate\": 14, \"oxygen_saturation\": 97, \"systolic_pressure\": 118, \"diastolic_pressure\": 79}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (29)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','DIDeAJ9IMxDPiCSks2OkeEcJsJafpuDr',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(53,79,31,52,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 22.1, \"height\": 173, \"weight\": 66, \"heart_rate\": 85, \"temperature\": 37.47250547416595, \"respiratory_rate\": 12, \"oxygen_saturation\": 98, \"systolic_pressure\": 130, \"diastolic_pressure\": 85}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (22.1)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','eAG4OSxg8BaHE44Gkf8guA1ffqp4XFHk',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 01:09:21','Ninguna','{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(54,80,31,53,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 30.9, \"height\": 163, \"weight\": 82, \"heart_rate\": 66, \"temperature\": 37.45709718122986, \"respiratory_rate\": 19, \"oxygen_saturation\": 98, \"systolic_pressure\": 118, \"diastolic_pressure\": 71}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Obesidad grado I (30.9)\n\nPérdida de peso estructurada (10-15%)\n\nIntervención nutricional intensiva\n\nPrograma de ejercicio supervisado\n\nEvaluación cardiovascular\n\nControl de diabetes e hipertensión\n\nSeguimiento médico mensual\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','vDLHzFWktPJQ2HQDeyuQQzM2Ju8QpFkj',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(55,81,31,54,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 29.8, \"height\": 170, \"weight\": 86, \"heart_rate\": 74, \"temperature\": 36.936694633866104, \"respiratory_rate\": 16, \"oxygen_saturation\": 98, \"systolic_pressure\": 121, \"diastolic_pressure\": 84}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (29.8)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','L7E0EJ4JFa1cURbZNbjzsM1DvrMOSIJT',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(56,82,31,55,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 21.7, \"height\": 182, \"weight\": 72, \"heart_rate\": 66, \"temperature\": 36.54932962414165, \"respiratory_rate\": 19, \"oxygen_saturation\": 97, \"systolic_pressure\": 115, \"diastolic_pressure\": 72}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (21.7)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','7KLa5v4exhV9f7l06lpDcER1Uzs18ti1',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}'),(57,83,31,56,'Examen de ingreso ocupacional',NULL,NULL,NULL,NULL,NULL,'{\"bmi\": 28.4, \"height\": 176, \"weight\": 88, \"heart_rate\": 90, \"temperature\": 36.57630915854782, \"respiratory_rate\": 15, \"oxygen_saturation\": 98, \"systolic_pressure\": 114, \"diastolic_pressure\": 70}','Apto para laborar',NULL,'Ninguno',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (28.4)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','apto','eZoDVDWE6HahTCet5Ji80mttol7vB3ex',NULL,NULL,'2026-03-07 00:52:28','2026-03-07 00:55:11',NULL,'{\"fitness_for_work\": \"apto\", \"physical_capacity\": \"normal\", \"work_environment_risk\": \"Bajo\"}');
/*!40000 ALTER TABLE `medical_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_reports`
--

DROP TABLE IF EXISTS `medical_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medical_history_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int NOT NULL,
  `report_type` enum('medical_history','diagnosis','laboratory','other') DEFAULT 'medical_history',
  `generated_by` int NOT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `generated_by` (`generated_by`),
  KEY `idx_medical_history_id` (`medical_history_id`),
  KEY `idx_generated_at` (`generated_at`),
  KEY `idx_report_type` (`report_type`),
  CONSTRAINT `medical_reports_ibfk_1` FOREIGN KEY (`medical_history_id`) REFERENCES `medical_histories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medical_reports_ibfk_2` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_reports`
--

LOCK TABLES `medical_reports` WRITE;
/*!40000 ALTER TABLE `medical_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `medical_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_email` (`email`),
  KEY `idx_expires` (`expires_at`),
  KEY `idx_used` (`used`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (19,36,'11233694f246d03054651dd8471166e8ec66b2951d264399652b6f1d3ee124d8','duberney22915@gmail.com','2026-03-07 02:55:02',1,'2026-03-07 02:25:02'),(20,36,'e4306f0dc7c500d63f7c21205b3475491ddc3bdbb300789c15e6854636350d9e','duberney22915@gmail.com','2026-03-07 02:59:28',0,'2026-03-07 02:29:28');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identification_number` varchar(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `document_type` enum('cedula','pasaporte','tarjeta_identidad') DEFAULT 'cedula',
  `document_number` varchar(20) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('masculino','femenino','otro') NOT NULL,
  `address` text,
  `company` varchar(100) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `blood_type` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL,
  `allergies` text,
  `medications` text,
  `medical_conditions` text,
  `assigned_doctor_id` int DEFAULT NULL,
  `created_by_user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `signature_path` varchar(255) DEFAULT NULL COMMENT 'Ruta de la imagen de firma del paciente',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_document_number` (`document_number`),
  UNIQUE KEY `identification_number` (`identification_number`),
  KEY `idx_identification` (`identification_number`),
  KEY `idx_name` (`name`),
  KEY `idx_company` (`company`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_patient_name_search` (`name`),
  KEY `assigned_doctor_id` (`assigned_doctor_id`),
  KEY `created_by_user_id` (`created_by_user_id`),
  KEY `fk_patients_company` (`company_id`),
  CONSTRAINT `fk_patients_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`assigned_doctor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `patients_ibfk_2` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (52,'9958113','Duberney Obando Cano','duberney22915@gmail.com','3145716188','cedula','9958113','1981-12-28','masculino','Calle 37A 43 39','INDEPENDIENTE','ESCOLTA',NULL,NULL,'Duberney Obando Cano','3145716188','https://pub-ae636adbab2e4ba4866cfe67874034ba.r2.dev/patients/patient_temp_1772824048957_1772824048970.webp','A+','No','NO','NO',NULL,30,'2026-01-15 22:57:56','2026-03-07 02:16:45','https://pub-ae636adbab2e4ba4866cfe67874034ba.r2.dev/signatures/signature_temp_1772849802159_1772849802171.png'),(53,'565423243','Andres Morales','andres@gmail.com','3145716188','cedula','565423243','1977-03-03','masculino','Calle 37A 43 39',NULL,'Escolta',11,NULL,'Duberney Obando Cano','3145716188','https://pub-ae636adbab2e4ba4866cfe67874034ba.r2.dev/patients/patient_temp_1772824011925_1772824012265.webp','A+','Ninguna','Ninguna','Ninguna',NULL,32,'2026-01-17 01:30:55','2026-03-06 19:06:58','https://pub-ae636adbab2e4ba4866cfe67874034ba.r2.dev/signatures/signature_temp_1772823999140_1772823999146.png'),(54,'1000644028','Andres Reyes','andres.reyes535@example.com','3002735784','cedula','1000644028','1995-08-06','masculino','Calle 32 #48-22','Bomberos Voluntarios','Conductor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(55,'1000805926','Carlos Rivera','carlos.rivera950@example.com','3003751989','cedula','1000805926','1979-10-29','masculino','Calle 61 #85-55','Contadores Asociados','Medico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(56,'1000469922','Andres Ramirez','andres.ramirez707@example.com','3001109362','cedula','1000469922','1991-12-03','femenino','Calle 81 #67-17','Bomberos Voluntarios','Policia',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(57,'1000814922','Jose Gomez','jose.gomez473@example.com','3004304840','cedula','1000814922','1972-11-21','masculino','Calle 5 #44-18','Transportes Rapidos','Vendedor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(58,'1000563966','Sofia Rivera','sofia.rivera699@example.com','3002209016','cedula','1000563966','1991-01-02','masculino','Calle 13 #43-64','Transportes Rapidos','Abogado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(59,'1000158229','Laura Reyes','laura.reyes649@example.com','3004944594','cedula','1000158229','1973-03-24','masculino','Calle 34 #45-27','Diseños Modernos','Estudiante',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(60,'1000136805','Pedro Martinez','pedro.martinez275@example.com','3008301736','cedula','1000136805','1985-08-24','masculino','Calle 9 #28-40','Ventas Globales','Contador',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(61,'1000574003','Andres Lopez','andres.lopez913@example.com','3007169598','cedula','1000574003','1977-12-24','femenino','Calle 10 #54-40','Hospital Central','Abogado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(62,'1000938631','Miguel Hernandez','miguel.hernandez671@example.com','3006900343','cedula','1000938631','1980-01-30','masculino','Calle 41 #49-88','Hospital Central','Carpintero',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(63,'1000452516','Andres Lopez','andres.lopez776@example.com','3001310300','cedula','1000452516','1974-10-26','femenino','Calle 41 #86-37','Bomberos Voluntarios','Vendedor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(64,'1000841431','Juan Torres','juan.torres924@example.com','3002441751','cedula','1000841431','1972-04-16','masculino','Calle 2 #58-71','Transportes Rapidos','Arquitecto',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(65,'1000793751','Carmen Gomez','carmen.gomez978@example.com','3008545870','cedula','1000793751','1978-05-25','masculino','Calle 47 #92-27','TechSol','Abogado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(66,'1000100440','Isabella Perez','isabella.perez552@example.com','3001803086','cedula','1000100440','1985-03-01','femenino','Calle 92 #88-29','Contadores Asociados','Policia',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(67,'1000853681','Isabella Gomez','isabella.gomez51@example.com','3001674934','cedula','1000853681','1992-01-02','femenino','Calle 23 #88-16','Seguridad Privada','Estudiante',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(68,'1000426936','Maria Torres','maria.torres17@example.com','3006047614','cedula','1000426936','1994-05-09','masculino','Calle 52 #14-40','Bomberos Voluntarios','Medico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:40:19','2026-03-07 00:40:19',NULL),(69,'1000268909','Ana Ramirez','ana.ramirez992@example.com','3005486807','cedula','1000268909','1990-10-02','femenino','Calle 82 #65-99','Construcciones SA','Abogado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(70,'1000644825','Carmen Gomez','carmen.gomez874@example.com','3006384148','cedula','1000644825','1983-05-21','masculino','Calle 19 #95-4','Contadores Asociados','Carpintero',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(71,'1000994177','Sofia Rodriguez','sofia.rodriguez426@example.com','3003391566','cedula','1000994177','1985-09-26','femenino','Calle 99 #76-20','Construcciones SA','Policia',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(72,'1000355673','Juan Rivera','juan.rivera76@example.com','3003363600','cedula','1000355673','1997-06-13','masculino','Calle 20 #22-21','Transportes Rapidos','Profesor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(73,'1000796869','Jose Diaz','jose.diaz470@example.com','3008923324','cedula','1000796869','1986-10-28','femenino','Calle 89 #71-54','Escuela Nacional','Estudiante',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(74,'1000608133','Sofia Ramirez','sofia.ramirez685@example.com','3008759895','cedula','1000608133','1982-08-26','femenino','Calle 59 #6-3','Contadores Asociados','Enfermero',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(75,'1000306177','Juan Gomez','juan.gomez713@example.com','3008770471','cedula','1000306177','1972-11-23','masculino','Calle 16 #87-25','Universidad Estatal','Enfermero',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(76,'1000258953','Carlos Flores','carlos.flores273@example.com','3006206018','cedula','1000258953','1997-02-27','femenino','Calle 32 #23-85','Bomberos Voluntarios','Enfermero',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(77,'1000663329','Miguel Hernandez','miguel.hernandez427@example.com','3006397846','cedula','1000663329','1992-06-10','masculino','Calle 84 #1-35','Clinica San Jose','Profesor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(78,'1000556112','Valentina Rodriguez','valentina.rodriguez209@example.com','3007559754','cedula','1000556112','1974-11-02','femenino','Calle 62 #90-43','Transportes Rapidos','Arquitecto',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(79,'1000792488','Laura Diaz','laura.diaz177@example.com','3005789721','cedula','1000792488','1970-02-08','femenino','Calle 72 #57-34','Diseños Modernos','Medico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(80,'1000252321','Maria Garcia','maria.garcia140@example.com','3003504125','cedula','1000252321','1985-10-29','masculino','Calle 94 #27-70','Diseños Modernos','Conductor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(81,'1000386602','Isabella Gonzalez','isabella.gonzalez890@example.com','3007659587','cedula','1000386602','1975-03-20','femenino','Calle 70 #14-29','Hospital Central','Arquitecto',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(82,'1000495415','Luis Rodriguez','luis.rodriguez665@example.com','3009029526','cedula','1000495415','1972-07-16','masculino','Calle 17 #86-46','Construcciones SA','Medico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL),(83,'1000720404','Isabella Lopez','isabella.lopez903@example.com','3002888844','cedula','1000720404','1998-01-06','masculino','Calle 88 #66-63','Electricidad Total','Profesor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,36,'2026-03-07 00:52:28','2026-03-07 00:52:28',NULL);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration_attempts`
--

DROP TABLE IF EXISTS `registration_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `invitation_code` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `success` tinyint(1) DEFAULT '0',
  `error_message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_code` (`invitation_code`),
  KEY `idx_success` (`success`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration_attempts`
--

LOCK TABLES `registration_attempts` WRITE;
/*!40000 ALTER TABLE `registration_attempts` DISABLE KEYS */;
INSERT INTO `registration_attempts` VALUES (11,'duberneycano2@gmail.com','NB1ZJ4KD','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1,NULL,'2026-01-15 22:56:01'),(12,'duberney.obando@cun.edu.co','QRB4UD0Y','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',1,NULL,'2026-01-17 00:17:28'),(13,'duberney22915@yahoo.com','VL8SHNDS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1,NULL,'2026-01-17 00:47:25'),(14,'duberney22915@yahoo.com','WULAPMRE','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',1,NULL,'2026-01-17 01:22:31'),(15,'duberney22915@gmail.com','SUPERADMIN-DUBERNEY','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',1,NULL,'2026-03-06 20:03:06'),(16,'duberney22915@gmail.com','WA9H0JFK','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',1,NULL,'2026-03-07 00:24:02');
/*!40000 ALTER TABLE `registration_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` text,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_setting_key` (`setting_key`),
  CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'company_name','Centro de Salud Ocupacional','Nombre de la institución',NULL,'2025-10-19 04:32:58'),(2,'appointment_duration','30','Duración predeterminada de citas en minutos',NULL,'2025-10-19 04:32:58'),(3,'max_patients_per_day','20','Máximo de pacientes por día por doctor',NULL,'2025-10-19 04:32:58'),(4,'pdf_logo_path','/assets/logo.png','Ruta del logo para reportes PDF',NULL,'2025-10-19 04:32:58'),(5,'default_timezone','America/Bogota','Zona horaria predeterminada',NULL,'2025-10-19 04:32:58');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('superadmin','admin','doctor','staff','company') NOT NULL DEFAULT 'staff',
  `specialization` varchar(100) DEFAULT NULL,
  `professional_license` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `document_number` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `company_id` int DEFAULT NULL,
  `signature_path` varchar(255) DEFAULT NULL COMMENT 'Ruta de la imagen de firma del médico (solo para role=doctor)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_active` (`is_active`),
  KEY `fk_users_company` (`company_id`),
  CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (31,'duberneycano2@gmail.com','$2b$12$2Wayo2MpOv.hgbbNWAyY0OQgy2ScvShLyDeyljDjpvXzesu4fDFLK','Luisa Fernanda Bermdez','doctor','Salud Ocupacional','76-2583, LSST: 63848/18','3145716188','31656315',1,'2026-03-07 02:17:22','2026-01-15 22:56:01','2026-03-07 02:17:22',NULL,'https://pub-ae636adbab2e4ba4866cfe67874034ba.r2.dev/signatures/doctor_31656315_1772843807022.png'),(34,'duberney22915@yahoo.com','$2b$12$81fuDQVvET9JtSrFQk.TDOwOFtYOR3zIL8uxOI37SebDfK.Tjekcy','Camila Perez','company',NULL,NULL,NULL,NULL,1,NULL,'2026-01-17 01:22:31','2026-01-17 01:22:31',11,NULL),(36,'duberney22915@gmail.com','$2b$12$RLAq8aLRxb8kJP5H1gT/H.Kg0V5lWFxE.ZbjAQgec1EyIAsiJ.R9W','Duberney Obando Cano','admin',NULL,NULL,NULL,NULL,1,'2026-03-07 02:49:58','2026-03-07 00:24:01','2026-03-07 02:49:58',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_certificates`
--

DROP TABLE IF EXISTS `work_certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_certificates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `appointment_id` int DEFAULT NULL,
  `certificate_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `aptitude_status` enum('apto','apto_con_restricciones','apto_manipulacion_alimentos','apto_trabajo_alturas','apto_espacios_confinados','apto_conduccion') NOT NULL,
  `restrictions` text,
  `recommendations` text,
  `validity_start` date DEFAULT NULL,
  `validity_end` date DEFAULT NULL,
  `verification_code` varchar(64) NOT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `verification_code` (`verification_code`),
  KEY `idx_verification_code` (`verification_code`),
  KEY `fk_work_cert_patient` (`patient_id`),
  KEY `fk_work_cert_doctor` (`doctor_id`),
  KEY `fk_work_cert_appointment` (`appointment_id`),
  CONSTRAINT `fk_work_cert_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `fk_work_cert_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_work_cert_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_certificates`
--

LOCK TABLES `work_certificates` WRITE;
/*!40000 ALTER TABLE `work_certificates` DISABLE KEYS */;
INSERT INTO `work_certificates` VALUES (110,52,31,36,'2026-01-15 18:03:55','apto_trabajo_alturas','Ninguna','Uso de EPP','2026-01-15','2027-01-15','sHtk3lclPfOJ4X1WNn6fw3AXBsacnSp8',NULL,'2026-01-15 18:03:55'),(111,52,31,36,'2026-01-15 18:14:19','apto_trabajo_alturas','Ninguna','Uso de EPP','2026-01-15','2027-01-15','u8xNfdfmEdrQMvmpuFhVv1VY0pLOukIF',NULL,'2026-01-15 18:14:19'),(112,52,31,36,'2026-01-15 18:16:10','apto_espacios_confinados','Niguna','Uso de EPP','2026-01-15','2027-01-15','2jgiMaHEyqvEguAXxNb1njKhOz3jQVkp',NULL,'2026-01-15 18:16:10'),(113,52,31,36,'2026-01-15 18:23:38','apto_con_restricciones','Ninguno','Ninguno','2026-01-15','2027-01-15','E2NKoqNeuNU1lO0EzCplZ3VWOuZFCizp',NULL,'2026-01-15 18:23:38'),(114,52,31,36,'2026-01-15 18:35:32','apto_manipulacion_alimentos','Ninguna','Ninguna','2026-01-15','2027-01-15','Q0DsGG2R7J8zLdjy4oZ9AH9cxCnHwimy',NULL,'2026-01-15 18:35:32'),(115,52,31,36,'2026-01-15 18:41:04','apto_con_restricciones','Ninguna','Uso de EPP de acuerdo al riesgo de exposición, pausas activas de acuerdo a las normas de la empresa, alternar tareas con el fin de\ndisminuir posiciones prolongadas y movimientos repetitivos, estilo de vida saludable, alimentación balanceada, ejercicio diario mínimo 1\nhora, higiene postural, valoración médico ocupacional periódica. Participar en las actividades del SG-SST. Levantamiento adecuado de\npeso.\n','2026-01-15','2027-01-15','hHjTfcW812UpdR2Turxdkj5KrIp50OuT',NULL,'2026-01-15 18:41:04'),(116,52,31,36,'2026-01-15 18:44:59','apto_con_restricciones','Ninguna','Uso de EPP de acuerdo al riesgo de exposición, pausas activas de acuerdo a las normas de la empresa, alternar tareas con el fin de\ndisminuir posiciones prolongadas y movimientos repetitivos, estilo de vida saludable, alimentación balanceada, ejercicio diario mínimo 1\nhora, higiene postural, valoración médico ocupacional periódica. Participar en las actividades del SG-SST. Levantamiento adecuado de\npeso.\n','2026-01-15','2027-01-15','MlFv6Leg1cvfjX3VtKYPougo5Y4S3Lwf',NULL,'2026-01-15 18:44:59'),(117,52,31,36,'2026-01-15 18:57:33','apto_trabajo_alturas','ninguna','Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an ','2026-01-15','2027-01-15','IH0INC8rVvlgFDOyJ099FnNGPAqZZmQs',NULL,'2026-01-15 18:57:33'),(118,52,31,36,'2026-01-15 18:58:45','apto_con_restricciones','Ninguna','Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an ','2026-01-15','2027-01-15','4uBdgcoZJ7jpMGNMljwjN4rqiNIjIcqg',NULL,'2026-01-15 18:58:45'),(119,52,31,36,'2026-01-15 19:02:03','apto','Ninguna','Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an ','2026-01-16','2027-01-16','PKW5FEEdCA3Hui046bD1WEKWBwcnbOkx',NULL,'2026-01-15 19:02:03'),(120,52,31,36,'2026-01-15 19:05:22','apto_con_restricciones','Ninguna','Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an ','2026-01-16','2027-01-16','mhiYe5XAIp0CE5Ph7Zy85kaW2EipJN9M',NULL,'2026-01-15 19:05:22'),(121,53,31,37,'2026-01-16 23:23:22','apto_espacios_confinados','Ninguna','Learn about the history, usage and variations of Lorem Ipsum, the industry\'s standard dummy text for over 2000 years. Generate your own Lorem Ipsum with a dictionary of over 200 Latin words\n','2026-01-17','2027-01-17','rgEeyk9Jh5o1UERUFDntynfwXHSYCt1H',NULL,'2026-01-16 23:23:22'),(122,52,31,36,'2026-02-02 00:00:00','apto','ninguna','ninguna','2026-02-02','2027-02-02','F8O5sp8elDdZ4snnKpqKiph9SIEsip4Q',NULL,'2026-03-05 18:34:24'),(123,52,31,36,'2026-03-06 00:00:00','apto','Ninguna','NInguna','2026-03-06','2027-03-06','B8pgEndYJX6JO51AZo8GnTRFGLcQSzeB',NULL,'2026-03-06 02:14:52'),(124,69,31,42,'2026-03-06 19:55:10','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (23.5)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial elevada\n\nModificaciones de estilo de vida\n\nControl cada 6 meses\n\nReducción de peso si es necesario\n\nLimitación de sodio (<2.3g/día)\n\nEjercicio aeróbico regular\n\nManejo del estrés laboral\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','oKss97OdxHEh3PQ8MRCKJDJNRRC9SFNM',NULL,'2026-03-06 19:55:10'),(125,70,31,43,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Obesidad grado I (30.1)\n\nPérdida de peso estructurada (10-15%)\n\nIntervención nutricional intensiva\n\nPrograma de ejercicio supervisado\n\nEvaluación cardiovascular\n\nControl de diabetes e hipertensión\n\nSeguimiento médico mensual\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','R2KL5EyrYWgaT7Y9FSHhfRIpJTHdsdlY',NULL,'2026-03-06 19:55:11'),(126,71,31,44,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (20.2)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','ZlL8yRyGMECjZpx5jZKPGbpr4IjW4EWX',NULL,'2026-03-06 19:55:11'),(127,72,31,45,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (23.9)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','cSWzsU9jemnjVbaCYPz6FU7kpwETsiZ9',NULL,'2026-03-06 19:55:11'),(128,73,31,46,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (23.1)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','HWwNxM9gduF9384cz96D7lwOfvOMwFbL',NULL,'2026-03-06 19:55:11'),(129,74,31,47,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (22.1)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','xuY8o1YEN4Q8X3gYWzBXLr6wjhJMaVtj',NULL,'2026-03-06 19:55:11'),(130,75,31,48,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (21.7)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','YnuGhDWZYK5UeXuDFGeEYdSdUfTX5yfj',NULL,'2026-03-06 19:55:11'),(131,76,31,49,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (27.8)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','KZCHdSVdG7IW58o1584twVHvKc1k2ZnH',NULL,'2026-03-06 19:55:11'),(132,77,31,50,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (29.1)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial elevada\n\nModificaciones de estilo de vida\n\nControl cada 6 meses\n\nReducción de peso si es necesario\n\nLimitación de sodio (<2.3g/día)\n\nEjercicio aeróbico regular\n\nManejo del estrés laboral\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','c1LkFh8AnBzqBhJGgfbug6Fm0g4BlXHF',NULL,'2026-03-06 19:55:11'),(133,78,31,51,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (29)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','yL9pWtUeO96MW4h9JlO9P0PVzjpRGGIP',NULL,'2026-03-06 19:55:11'),(134,79,31,52,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (22.1)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','IPfQxYFrvU1Aw0MYgyww9bLWDfac2Osi',NULL,'2026-03-06 19:55:11'),(135,80,31,53,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Obesidad grado I (30.9)\n\nPérdida de peso estructurada (10-15%)\n\nIntervención nutricional intensiva\n\nPrograma de ejercicio supervisado\n\nEvaluación cardiovascular\n\nControl de diabetes e hipertensión\n\nSeguimiento médico mensual\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','ILLR21wKvg4s19jfwXG8dOIcHVD2ZRpC',NULL,'2026-03-06 19:55:11'),(136,81,31,54,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (29.8)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','jqr2Gu8fSkA7wtev9LdhaarlkDiqntwW',NULL,'2026-03-06 19:55:11'),(137,82,31,55,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (21.7)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','8ORcZgjlWRlEiS4meWuSH1LFuA4kE2vo',NULL,'2026-03-06 19:55:11'),(138,83,31,56,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (28.4)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','ZbvNyzKt4EBqEpQzMKWfTb6Ez5ksntnp',NULL,'2026-03-06 19:55:11'),(139,54,31,57,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (29.4)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','D877Ig28cbcRpGEow7s6WXC3rzuWRC04',NULL,'2026-03-06 19:55:11'),(140,55,31,58,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (22.1)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','Y0ccakFhl8HOtWTCy5NKujjTjnbmtrGE',NULL,'2026-03-06 19:55:11'),(141,56,31,59,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (28)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','5ztC1RDVGp5DkvmSW33Qrdnx7hZ1pDhM',NULL,'2026-03-06 19:55:11'),(142,57,31,60,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Peso normal (19.8)\n\nMantener peso actual\n\nDieta balanceada y ejercicio regular\n\nControles médicos anuales\n\nPromoción de hábitos saludables\n\nPresión arterial: Presión arterial normal\n\nMantener estilo de vida saludable\n\nControl anual de presión arterial\n\nEjercicio regular\n\nDieta balanceada baja en sodio\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','4bMGAIX62yfNbUt4Gxa5puUCrHvllayh',NULL,'2026-03-06 19:55:11'),(143,58,31,61,'2026-03-06 19:55:11','apto',NULL,'Uso de EPP según cargo.\n\nIMC: Sobrepeso (27.4)\n\nReducción de peso gradual (5-10%)\n\nPlan nutricional personalizado\n\nEjercicio aeróbico 150 min/semana\n\nControl de comorbilidades\n\nSeguimiento médico cada 6 meses\n\nPresión arterial: Hipertensión arterial estadio 1\n\nInicio de tratamiento farmacológico\n\nControl mensual hasta estabilización\n\nEvaluación de daño a órganos blanco\n\nRestricción de trabajos de alto estrés\n\nEvitar exposición a calor extremo\n\nEvaluación cardiológica anual\n\nFrecuencia cardíaca: Frecuencia cardíaca normal\n\nMantener actividad física regular\n\nControl anual de función cardiovascular','2026-03-07','2027-03-07','VZ0uxlqkUYwadkVSWLLBUXnXzw3WOjif',NULL,'2026-03-06 19:55:11'),(144,79,31,52,'2026-03-06 20:09:21','apto','Ninguna','Ninguna','2026-02-01','2027-02-01','j3XwXqN3DwfMPxEBJIICQT7tGgEQMm1i',NULL,'2026-03-06 20:09:21'),(145,52,31,36,'2026-03-06 20:58:11','apto','ninguna','ninguna','2026-03-07','2027-03-07','wI5BAgjk5EeDsfhaW1anJa9XSxGCv4pe',NULL,'2026-03-06 20:58:11'),(146,52,31,39,'2026-03-06 21:15:20','apto','Ninguna','Ninguna','2025-12-31','2025-12-31','Kdg8Hjddw3InpsYpBLr4ZfHYoSrO9j1c',NULL,'2026-03-06 21:15:20');
/*!40000 ALTER TABLE `work_certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'occupational_health'
--

--
-- Dumping routines for database 'occupational_health'
--

--
-- Final view structure for view `appointment_summary`
--

/*!50001 DROP VIEW IF EXISTS `appointment_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `appointment_summary` AS select `a`.`id` AS `id`,`a`.`appointment_date` AS `appointment_date`,`p`.`name` AS `patient_name`,`p`.`identification_number` AS `identification_number`,`u`.`name` AS `doctor_name`,`a`.`status` AS `status`,`a`.`type` AS `type` from ((`appointments` `a` join `patients` `p` on((`a`.`patient_id` = `p`.`id`))) join `users` `u` on((`a`.`doctor_id` = `u`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-06 22:04:37
