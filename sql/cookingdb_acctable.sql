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
-- Table structure for table `acctable`
--

DROP TABLE IF EXISTS `acctable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acctable` (
  `accID` varchar(20) NOT NULL,
  `accName` varchar(100) DEFAULT NULL,
  `accUserName` varchar(100) DEFAULT NULL,
  `accPresentation` varchar(100) DEFAULT NULL,
  `accLink` varchar(100) DEFAULT NULL,
  `imgID` varchar(20) DEFAULT NULL,
  `accPass` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`accID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acctable`
--

LOCK TABLES `acctable` WRITE;
/*!40000 ALTER TABLE `acctable` DISABLE KEYS */;
INSERT INTO `acctable` VALUES ('acc-001','Alice Smith','alice_s','CEO','https://example.com/alice','img-001','0123456789'),('acc-002','Bob Johnson','bobby_j','CTO','https://example.com/bob','img-002','0123456789'),('acc-003','Carol Lee','carol_lee','CFO','https://example.com/carol','img-003','0123456789'),('acc-004','David Kim','davidk','COO','https://example.com/david','img-004','0123456789'),('acc-005','Eva Martinez','eva_m','CMO','https://example.com/eva','img-005','0123456789'),('acc-006','Melanie Martinez','test','CEO','https://example.com/alice','img-006','0123456789'),('acc-007','Dominic Isais','dominic123','ayoko na man.','https://testing.com','img-001','$2a$10$yaJ6myKvQUAAc0LqzAScHOo/XUXfd/QbJ8iYN1vPAMQ4w.P49V4Ei'),('acc-008','','nami','','ydiahsbdb@gmail.com','','$2a$10$9KqX1pxSKXoBMGz/eBzgQ.cPPnRukdJA4CwuuiTJGFXARoLNc4fxO');
/*!40000 ALTER TABLE `acctable` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_acc_insert` BEFORE INSERT ON `acctable` FOR EACH ROW BEGIN
    DECLARE max_num INT;

    -- Get the numeric part of the current max accID
    SELECT IFNULL(MAX(CAST(SUBSTRING(accID,5) AS UNSIGNED)), 0)
    INTO max_num
    FROM accTable;

    -- Assign NEW.accID as 'acc-' + zero-padded number
    SET NEW.accID = CONCAT('acc-', LPAD(max_num + 1, 3, '0'));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-17 23:16:29
