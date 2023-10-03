-- CHESS WEB Interface Schema
-- Designed by Ales Varabyou
-- Mon Oct  2 20:09:37 2023

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema CHESS_DB
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `CHESS_DB` ;

-- -----------------------------------------------------
-- Schema CHESS_DB
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `CHESS_DB` ;
USE `CHESS_DB` ;

-- -----------------------------------------------------
-- Table `CHESS_DB`.`Transcripts`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Transcripts` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Transcripts` (
  `tid` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'tid is arbitrary number. It can represent multiple transcript_ids (merged into the record from multiple sources)\n\nHow do we handle cases where the same transcript is coding in one and non-coding in another database?\nHow do we handle cases where the same transcript is listed under different types\n\nAttributes are best to separate out, but then they also need to be linked to the source then\n	since we need to be able to tell which attributes for a given transcript came from which source',
  `seqid` VARCHAR(45) NOT NULL,
  `strand` BIT NOT NULL,
  `start` INT UNSIGNED NOT NULL,
  `end` INT UNSIGNED NOT NULL,
  `score` SMALLINT NULL,
  `exons` TEXT NOT NULL,
  `lastUpdated` TIMESTAMP NOT NULL,
  PRIMARY KEY (`tid`),
  UNIQUE INDEX `tid_UNIQUE` (`tid` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Organism`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Organism` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Organism` (
  `organismID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `information` TEXT NULL,
  PRIMARY KEY (`organismID`),
  UNIQUE INDEX `organismID_UNIQUE` (`organismID` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Assembly`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Assembly` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Assembly` (
  `assemblyiD` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `information` TEXT NOT NULL,
  `link` TEXT NOT NULL,
  `organismID` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`assemblyiD`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  UNIQUE INDEX `organismID_UNIQUE` (`assemblyiD` ASC) VISIBLE,
  INDEX `fk_Assembly_organismID_idx` (`organismID` ASC) VISIBLE,
  CONSTRAINT `fk_Assembly_organismID`
    FOREIGN KEY (`organismID`)
    REFERENCES `CHESS_DB`.`Organism` (`organismID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Genome Assembly information.';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Sources`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Sources` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Sources` (
  `sourceID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(10) NOT NULL,
  `information` TEXT NOT NULL,
  `link` TEXT NOT NULL,
  `assemblyID` INT UNSIGNED NOT NULL,
  `originalFormat` ENUM("gtf", "gff") NOT NULL,
  `lastUpdated` VARCHAR(45) NULL,
  PRIMARY KEY (`sourceID`),
  UNIQUE INDEX `sourceID_UNIQUE` (`sourceID` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  INDEX `fk_Sources_assembly_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `fk_Sources_assembly`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `CHESS_DB`.`Assembly` (`assemblyiD`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Genes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Genes` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Genes` (
  `gid` VARCHAR(50) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `type` ENUM("protein_coding", "lncRNA", "ncRNA", "miscRNA", "antisenseRNA") NOT NULL,
  `description` TEXT NULL,
  `sourceID` INT UNSIGNED NOT NULL COMMENT 'Unlike for transcripts where we can establish equality between two isoforms, telling that two genes are the same is much more difficult.\nHence we keep all gene records without deduplicating them. As a sideeffect, we do not need to store a many-to-many relationship to the Sources like we do with Transcripts.\nSince every gene in a catalog is added as a separate record, the source can be listed directly as a foreign key instead.\nHowever a transcript-to-gene many-to-many relatioship is used instead.',
  PRIMARY KEY (`gid`),
  UNIQUE INDEX `gid_UNIQUE` (`gid` ASC) VISIBLE,
  INDEX `fk_Genes_source_idx` (`sourceID` ASC) VISIBLE,
  INDEX `type` (`type` ASC) VISIBLE,
  CONSTRAINT `fk_Genes_source`
    FOREIGN KEY (`sourceID`)
    REFERENCES `CHESS_DB`.`Sources` (`sourceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`TranscriptToGene`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`TranscriptToGene` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`TranscriptToGene` (
  `tid` INT UNSIGNED NOT NULL,
  `gid` VARCHAR(50) COLLATE 'Default Collation' NOT NULL,
  PRIMARY KEY (`tid`, `gid`),
  INDEX `fk_TranscriptToGene_gid_idx` (`gid` ASC) VISIBLE,
  CONSTRAINT `fk_TranscriptToGene_tid`
    FOREIGN KEY (`tid`)
    REFERENCES `CHESS_DB`.`Transcripts` (`tid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TranscriptToGene_gid`
    FOREIGN KEY (`gid`)
    REFERENCES `CHESS_DB`.`Genes` (`gid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Single tid can be assigned to multiple genes (from different sources) but to a single gene only from a single source.\nA gene can link to multiple transcripts both within and between sources.';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Datasets`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Datasets` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Datasets` (
  `datasetID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `sampleCount` INT NOT NULL COMMENT 'total number of samples in the dataset',
  `information` TEXT NOT NULL,
  PRIMARY KEY (`datasetID`),
  UNIQUE INDEX `datasetID_UNIQUE` (`datasetID` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB
COMMENT = 'Holds information about RNAseq datasets which can be added to store expression data and possibly other information about transcripts \nbased on the sequencing data available';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`TranscriptToDataset`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`TranscriptToDataset` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`TranscriptToDataset` (
  `tid` INT UNSIGNED NOT NULL,
  `datasetID` INT UNSIGNED NOT NULL,
  `sampleCount` INT UNSIGNED NOT NULL,
  `expressionMean` FLOAT NOT NULL,
  `expressionStd` FLOAT NOT NULL,
  PRIMARY KEY (`tid`, `datasetID`),
  INDEX `fk_TranscriptToDataset_dataset_idx` (`datasetID` ASC) VISIBLE,
  INDEX `sampleCount` (`sampleCount` ASC) VISIBLE,
  INDEX `expressionMean` (`expressionMean` ASC) VISIBLE,
  CONSTRAINT `fk_TranscriptToDataset_tid`
    FOREIGN KEY (`tid`)
    REFERENCES `CHESS_DB`.`Transcripts` (`tid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TranscriptToDataset_dataset`
    FOREIGN KEY (`datasetID`)
    REFERENCES `CHESS_DB`.`Datasets` (`datasetID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'stores expression data for the transcripts and links it to the information about the dataset that generated corroborating data';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`TxDBXREF`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`TxDBXREF` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`TxDBXREF` (
  `tid` INT UNSIGNED NOT NULL,
  `sourceID` INT UNSIGNED NOT NULL,
  `transcript_id` VARCHAR(50) NOT NULL,
  `type` ENUM("protein_coding", "non_coding", "antisense") NULL,
  `cds` TEXT NULL,
  `prime3` INT UNSIGNED NOT NULL COMMENT 'prime3 and prime5 (3\' and 5\') are coordinates specific to the version of the transcript on this particular source',
  `prime5` INT UNSIGNED NOT NULL COMMENT 'prime3 and prime5 (3\' and 5\') are coordinates specific to the version of the transcript on this particular source',
  PRIMARY KEY (`tid`, `sourceID`),
  INDEX `fk_TxDBXREF_source_idx` (`sourceID` ASC) VISIBLE,
  INDEX `type` (`type` ASC) VISIBLE,
  CONSTRAINT `fk_TxDBXREF_tid`
    FOREIGN KEY (`tid`)
    REFERENCES `CHESS_DB`.`Transcripts` (`tid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TxDBXREF_source`
    FOREIGN KEY (`sourceID`)
    REFERENCES `CHESS_DB`.`Sources` (`sourceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'This table is used to build a transcript map between sources.\nFor a transcript we can tell all sources and corresponding ID for each along with additional information that may vary from source to source.\nWhile the Transcripts table provides a high-level overview of the transcripts, deduplicating many entries and hiding some of the information';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Attributes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Attributes` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Attributes` (
  `tid` INT UNSIGNED NOT NULL,
  `sourceID` INT UNSIGNED NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `value` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`tid`, `sourceID`, `name`),
  CONSTRAINT `fk_Attributes_tidsource`
    FOREIGN KEY (`tid` , `sourceID`)
    REFERENCES `CHESS_DB`.`TxDBXREF` (`tid` , `sourceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Table listing all possible attribute keys stored across all datasets.\nAutoupdates timestamps in the transcripts on insert/update via triggers.';

USE `CHESS_DB`;

DELIMITER $$

USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`update_sources_lastUpdated_after_insert_in_Transcripts` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`update_sources_lastUpdated_after_insert_in_Transcripts` AFTER INSERT ON `Transcripts` FOR EACH ROW
BEGIN
	-- 'propagates lastUpdated to the Source through dbxref'
    UPDATE Sources
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE sid IN (SELECT sid FROM TxDBXREF WHERE tid = NEW.tid);
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`update_sources_lastUpdated_after_update_in_Transcripts` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`update_sources_lastUpdated_after_update_in_Transcripts` AFTER UPDATE ON `Transcripts` FOR EACH ROW
BEGIN
	-- 'propagates lastUpdated to the Source through dbxref'
    UPDATE Sources
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE sid IN (SELECT sid FROM TxDBXREF WHERE tid = NEW.tid);
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`update_sources_lastUpdated_after_delete_in_Transcripts` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`update_sources_lastUpdated_after_delete_in_Transcripts` AFTER DELETE ON `Transcripts` FOR EACH ROW
BEGIN
	-- 'propagates lastUpdated to the Source through dbxref'
    UPDATE Sources
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE sid IN (SELECT sid FROM TxDBXREF WHERE tid = OLD.tid);
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`Attributes_AFTER_INSERT` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`Attributes_AFTER_INSERT` AFTER INSERT ON `Attributes` FOR EACH ROW
BEGIN
	UPDATE Transcripts
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE tid = NEW.tid;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`Attributes_AFTER_UPDATE` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`Attributes_AFTER_UPDATE` AFTER UPDATE ON `Attributes` FOR EACH ROW
BEGIN
    UPDATE Transcripts
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE tid = NEW.tid;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`Attributes_AFTER_DELETE` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`Attributes_AFTER_DELETE` AFTER DELETE ON `Attributes` FOR EACH ROW
BEGIN
	UPDATE Transcripts
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE tid = OLD.tid;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
