CREATE DATABASE  IF NOT EXISTS `cookingdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cookingdb`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cookingdb
-- ------------------------------------------------------
-- Server version	9.3.0

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
-- Table structure for table `imgtable`
--

DROP TABLE IF EXISTS `imgtable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imgtable` (
  `imgID` varchar(20) NOT NULL,
  `imgFileName` varchar(255) NOT NULL,
  `imgPath` varchar(500) NOT NULL,
  `imgMime_type` varchar(100) NOT NULL,
  `imgSize` int NOT NULL,
  `imgUploadDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`imgID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imgtable`
--

LOCK TABLES `imgtable` WRITE;
/*!40000 ALTER TABLE `imgtable` DISABLE KEYS */;
INSERT INTO `imgtable` VALUES ('img-001','adobo.jpg','/uploads/images/adobo.jpg','image/jpeg',204800,'2026-01-13 08:42:47'),('img-003','pasta.png','/uploads/images/pasta.png','image/png',356000,'2026-01-13 08:42:47'),('img-004','img-004.png','D:\\files\\Online Classes\\College\\3rd Year\\1st Sem\\random\\WhatsCookin\\backend\\uploads\\images\\img-004.png','image/png',97084,'2026-01-13 08:50:59'),('img-005','img-005.png','D:\\files\\Online Classes\\College\\3rd Year\\1st Sem\\random\\WhatsCookin\\backend\\uploads\\images\\img-005.png','image/png',97084,'2026-01-13 08:54:23'),('img-006','img-006.png','/uploads/images/img-006.png','image/png',97084,'2026-01-13 08:57:31'),('img-007','img-007.png','/uploads/images/img-007.png','image/png',97084,'2026-01-13 09:43:09'),('img-008','img-008.jpg','/uploads/images/img-008.jpg','image/jpeg',127964,'2026-01-13 10:31:05'),('img-009','img-009.jpg','/uploads/images/img-009.jpg','image/jpeg',142336,'2026-01-16 15:51:12'),('img-010','img-010.jpg','/uploads/images/img-010.jpg','image/jpeg',142336,'2026-01-16 19:18:18'),('img-011','img-011.jpg','/uploads/images/img-011.jpg','image/jpeg',110456,'2026-01-16 19:39:11'),('img-012','img-012.jpg','/uploads/images/img-012.jpg','image/jpeg',103968,'2026-01-16 19:59:50'),('img-013','img-013.jpg','/uploads/images/img-013.jpg','image/jpeg',100704,'2026-01-16 20:08:13'),('img-014','img-014.jpg','/uploads/images/img-014.jpg','image/jpeg',185205,'2026-01-16 20:17:31'),('img-015','img-015.jpg','/uploads/images/img-015.jpg','image/jpeg',122042,'2026-01-16 20:26:22'),('img-016','img-016.jpg','/uploads/images/img-016.jpg','image/jpeg',96020,'2026-01-16 20:30:35'),('img-017','img-017.jpg','/uploads/images/img-017.jpg','image/jpeg',110524,'2026-01-16 20:36:05'),('img-018','img-018.jpg','/uploads/images/img-018.jpg','image/jpeg',103749,'2026-01-16 20:42:22'),('img-019','img-019.jpg','/uploads/images/img-019.jpg','image/jpeg',77998,'2026-01-16 20:52:24'),('img-020','img-020.jpg','/uploads/images/img-020.jpg','image/jpeg',151121,'2026-01-16 21:01:31'),('img-021','img-021.jpg','/uploads/images/img-021.jpg','image/jpeg',115654,'2026-01-16 21:05:01'),('img-022','img-022.jpg','/uploads/images/img-022.jpg','image/jpeg',118495,'2026-01-16 21:12:06'),('img-023','img-023.jpg','/uploads/images/img-023.jpg','image/jpeg',86633,'2026-01-17 03:41:51'),('img-024','img-024.jpg','/uploads/images/img-024.jpg','image/jpeg',59152,'2026-01-17 04:52:47'),('img-025','img-025.jpg','/uploads/images/img-025.jpg','image/jpeg',103678,'2026-01-17 04:59:29'),('img-026','img-026.jpg','/uploads/images/img-026.jpg','image/jpeg',103207,'2026-01-17 05:05:20'),('img-027','img-027.jpg','/uploads/images/img-027.jpg','image/jpeg',31655,'2026-01-17 05:11:24'),('img-028','img-028.jpg','/uploads/images/img-028.jpg','image/jpeg',64016,'2026-01-17 05:17:15'),('img-029','img-029.jpg','/uploads/images/img-029.jpg','image/jpeg',156056,'2026-01-17 05:24:38'),('img-030','img-030.png','/uploads/images/img-030.png','image/png',26806,'2026-01-17 05:39:28'),('img-031','img-031.png','/uploads/images/img-031.png','image/png',21566,'2026-01-17 05:43:15'),('img-032','img-032.png','/uploads/images/img-032.png','image/png',22564,'2026-01-17 05:51:30'),('img-033','img-033.png','/uploads/images/img-033.png','image/png',42858,'2026-01-17 05:54:59'),('img-034','img-034.png','/uploads/images/img-034.png','image/png',47842,'2026-01-17 06:00:57');
/*!40000 ALTER TABLE `imgtable` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-17 23:16:29
