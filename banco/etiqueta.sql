-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 13/03/2024 às 18:55
-- Versão do servidor: 8.2.0
-- Versão do PHP: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `etiqueta`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `items`
--

DROP TABLE IF EXISTS `items`;
CREATE TABLE IF NOT EXISTS `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codItems` varchar(255) NOT NULL,
  `tombo` varchar(255) NOT NULL,
  `ip` varchar(100) NOT NULL,
  `itemName` varchar(255) NOT NULL,
  `entryDate` date NOT NULL,
  `description` text,
  `location` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `items`
--

INSERT INTO `items` (`id`, `codItems`, `tombo`, `ip`, `itemName`, `entryDate`, `description`, `location`) VALUES
(1, 'CCD001', '160001', '127.0.0.1', 'Cadeira Presidente', '2023-09-24', 'Cadeira presidente em couro preto', 'Sala de reunião'),
(2, 'CCD002', '160002', '', 'Desktop DELL', '2023-09-25', 'Desktop dell tower', 'Suporte técnico'),
(3, 'CCD003', '199401', '10.48.119.143', 'Desktop POSITIVO', '2023-10-10', '+ 3 Monitores POSITIVO, Mouse e Teclado.', 'Setor Técnico'),
(4, 'CCD004', '199405', '10.48.119.115', 'Desktop DELL', '2023-10-16', 'Desktop DELL teste', 'Suporte técnico');

-- --------------------------------------------------------

--
-- Estrutura para tabela `qrcodehistory`
--

DROP TABLE IF EXISTS `qrcodehistory`;
CREATE TABLE IF NOT EXISTS `qrcodehistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `itemsId` int DEFAULT NULL,
  `dateScanned` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `itemsId` (`itemsId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `status` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `user`
--

INSERT INTO `user` (`id`, `username`, `password`, `status`) VALUES
(1, 'root', 'root', 1);

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `qrcodehistory`
--
ALTER TABLE `qrcodehistory`
  ADD CONSTRAINT `qrcodehistory_ibfk_1` FOREIGN KEY (`itemsId`) REFERENCES `items` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
