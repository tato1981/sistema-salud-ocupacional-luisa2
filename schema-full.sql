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
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (84,'9958113','Duberney Obando Cano','duberney22915@gmail.com','3145716188','cedula','9958113','1981-12-28','masculino','Calle 37A 43 39',NULL,'ESCOLTA',NULL,NULL,'Raul Obando','3128313054','https://pub-ae636adbab2e4ba4866cfe67874034ba.r2.dev/patients/patient_temp_1772859560879_1772859560993.webp','A+','Niega','Niega','Buenas',NULL,36,'2026-03-07 05:00:15','2026-03-07 05:00:15','https://pub-ae636adbab2e4ba4866cfe67874034ba.r2.dev/signatures/signature_temp_1772859544542_1772859544547.png');
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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (36,'duberney22915@gmail.com','$2b$12$RLAq8aLRxb8kJP5H1gT/H.Kg0V5lWFxE.ZbjAQgec1EyIAsiJ.R9W','Duberney Obando Cano','admin',NULL,NULL,NULL,NULL,1,'2026-03-07 04:58:42','2026-03-07 00:24:01','2026-03-07 04:58:42',NULL,NULL),(37,'luisafernandabermudez1983@gmail.com','$2b$12$mHpxpi5yyK7udeatPUBRQ.6fJv8126KF3r4DKpMUxie03J9vwrvYy','Luisa Fernanda Bermúdez','doctor','Salud Ocupacional','76-2583, LSST: 63848/18','3006741372','31656315',1,'2026-03-07 05:04:06','2026-03-07 05:02:39','2026-03-07 05:04:06',NULL,'https://pub-ae636adbab2e4ba4866cfe67874034ba.r2.dev/signatures/doctor_31656315_1772859759170.png');
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

-- Dump completed on 2026-03-07  0:10:48
