-- MySQL Script generated by MySQL Workbench
-- Thu Feb  1 17:08:14 2024
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema default_schema
-- -----------------------------------------------------
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
-- Table `CHESS_DB`.`Organism`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Organism` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Organism` (
  `organismID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `scientificName` VARCHAR(45) NOT NULL,
  `commonName` VARCHAR(45) NOT NULL,
  `information` TEXT NULL DEFAULT NULL,
  UNIQUE INDEX `name_UNIQUE` (`commonName` ASC) VISIBLE,
  PRIMARY KEY (`organismID`),
  UNIQUE INDEX `scientificName_UNIQUE` (`scientificName` ASC) VISIBLE,
  UNIQUE INDEX `organismID_UNIQUE` (`organismID` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Assembly`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Assembly` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Assembly` (
  `assemblyID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyName` VARCHAR(45) NOT NULL,
  `information` TEXT NOT NULL,
  `link` TEXT NOT NULL,
  `organismID` INT UNSIGNED NOT NULL,
  UNIQUE INDEX `organismID_UNIQUE` (`assemblyName` ASC) VISIBLE,
  INDEX `fk_Assembly_organismName_idx` (`organismID` ASC) VISIBLE,
  PRIMARY KEY (`assemblyID`),
  UNIQUE INDEX `aid_UNIQUE` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `fk_Assembly_organismID`
    FOREIGN KEY (`organismID`)
    REFERENCES `CHESS_DB`.`Organism` (`organismID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Genome Assembly information.';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`SequenceID`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`SequenceID` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`SequenceID` (
  `assemblyID` INT UNSIGNED NOT NULL,
  `sequenceID` INT UNSIGNED NOT NULL,
  `length` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`assemblyID`, `sequenceID`),
  CONSTRAINT `fk_SequenceIDs_assembly`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `CHESS_DB`.`Assembly` (`assemblyID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Describes a set of possible sequence IDs for a given assembly.\\nWhen adding transcript records - we check against this to make sure all records are on available sequences.\\nIf multiple nomenclatures exist for a given assembly - SequenceIDMap should be used to link them together.';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Transcript`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Transcript` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Transcript` (
  `tid` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'tid is arbitrary number. It can represent multiple transcript_ids (merged into the record from multiple sources)',
  `assemblyID` INT UNSIGNED NOT NULL,
  `sequenceID` INT UNSIGNED NOT NULL,
  `strand` BIT NOT NULL,
  `start` INT UNSIGNED NOT NULL,
  `end` INT UNSIGNED NOT NULL,
  `lastUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tid`),
  UNIQUE INDEX `tid_UNIQUE` (`tid` ASC) VISIBLE,
  INDEX `fk_Transcript_sequenceID_idx` (`assemblyID` ASC, `sequenceID` ASC) VISIBLE,
  CONSTRAINT `fk_Transcript_sequenceID`
    FOREIGN KEY (`assemblyID` , `sequenceID`)
    REFERENCES `CHESS_DB`.`SequenceID` (`assemblyID` , `sequenceID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Sources`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Sources` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Sources` (
  `sourceID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `information` TEXT NOT NULL,
  `link` TEXT NOT NULL,
  `originalFormat` ENUM("gtf", "gff") NOT NULL,
  `lastUpdated` VARCHAR(45) NULL DEFAULT NULL,
  `assemblyID` INT UNSIGNED NOT NULL,
  `citation` TEXT NOT NULL,
  PRIMARY KEY (`sourceID`),
  UNIQUE INDEX `sourceID_UNIQUE` (`sourceID` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  INDEX `fk_assemblyName_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `fk_assemblyName`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `CHESS_DB`.`Assembly` (`assemblyID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`AttributeKey`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`AttributeKey` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`AttributeKey` (
  `key_name` VARCHAR(45) NOT NULL,
  `variable` TINYINT(1) NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`key_name`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`AttributeKeyValue`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`AttributeKeyValue` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`AttributeKeyValue` (
  `key_name` VARCHAR(45) NOT NULL,
  `value` VARCHAR(45) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL DEFAULT '',
  `kvid` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'useful for quick queries, since it is numerical',
  PRIMARY KEY (`key_name`, `value`),
  UNIQUE INDEX `kvid_UNIQUE` (`kvid` ASC) VISIBLE,
  CONSTRAINT `fk_AttributeKeyValue_key`
    FOREIGN KEY (`key_name`)
    REFERENCES `CHESS_DB`.`AttributeKey` (`key_name`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'for standard keys, this map specifies which values are permitted and stores the relationship';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`AttributeValueMap`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`AttributeValueMap` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`AttributeValueMap` (
  `key_name` VARCHAR(45) NOT NULL,
  `og_value` VARCHAR(45) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL DEFAULT '',
  `std_value` VARCHAR(45) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL DEFAULT '',
  PRIMARY KEY (`key_name`, `og_value`),
  INDEX `fk_Values_key_idx` (`key_name` ASC, `std_value` ASC) VISIBLE,
  CONSTRAINT `fk_Values_key_value`
    FOREIGN KEY (`key_name` , `std_value`)
    REFERENCES `CHESS_DB`.`AttributeKeyValue` (`key_name` , `value`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Locus`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Locus` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Locus` (
  `lid` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyID` INT UNSIGNED NOT NULL,
  `sequenceID` INT UNSIGNED NOT NULL,
  `strand` BIT NOT NULL,
  `start` INT UNSIGNED NOT NULL,
  `end` INT UNSIGNED NOT NULL,
  `lastUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lid`),
  UNIQUE INDEX `lid_UNIQUE` (`lid` ASC) VISIBLE,
  INDEX `fk_Locus_sequence_idx` (`assemblyID` ASC, `sequenceID` ASC) VISIBLE,
  CONSTRAINT `fk_Locus_sequence`
    FOREIGN KEY (`assemblyID` , `sequenceID`)
    REFERENCES `CHESS_DB`.`SequenceID` (`assemblyID` , `sequenceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Generalization to keep together related transcripts across all sources (much like the Transcript table)';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Gene`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Gene` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Gene` (
  `gid` VARCHAR(50) NOT NULL,
  `sourceID` INT UNSIGNED NOT NULL COMMENT 'Unlike for transcripts where we can establish equality between two isoforms, telling that two genes are the same is much more difficult.\\nHence we keep all gene records without deduplicating them. As a sideeffect, we do not need to store a many-to-many relationship to the Sources like we do with Transcripts.\\nSince every gene in a catalog is added as a separate record, the source can be listed directly as a foreign key instead.\\nHowever a transcript-to-gene many-to-many relatioship is used instead.',
  `name` VARCHAR(45) NOT NULL,
  `type_key` VARCHAR(45) NOT NULL,
  `type_value` VARCHAR(45) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `lid` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`gid`, `sourceID`),
  UNIQUE INDEX `gid_UNIQUE` (`gid` ASC) VISIBLE,
  INDEX `fk_Genes_source_idx` (`sourceID` ASC) VISIBLE,
  INDEX `fk_Gene_type_idx` (`type_key` ASC, `type_value` ASC) VISIBLE,
  INDEX `fk_Gene_locus_idx` (`lid` ASC) VISIBLE,
  CONSTRAINT `fk_Genes_source`
    FOREIGN KEY (`sourceID`)
    REFERENCES `CHESS_DB`.`Sources` (`sourceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Gene_type`
    FOREIGN KEY (`type_key` , `type_value`)
    REFERENCES `CHESS_DB`.`AttributeValueMap` (`key_name` , `og_value`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Gene_locus`
    FOREIGN KEY (`lid`)
    REFERENCES `CHESS_DB`.`Locus` (`lid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Dataset`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Dataset` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Dataset` (
  `datasetID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `sampleCount` INT NOT NULL COMMENT 'total number of samples in the dataset',
  `information` TEXT NOT NULL,
  PRIMARY KEY (`datasetID`),
  UNIQUE INDEX `datasetID_UNIQUE` (`datasetID` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB
COMMENT = 'Holds information about RNAseq datasets which can be added to store expression data and possibly other information about transcripts \\nbased on the sequencing data available';


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
    REFERENCES `CHESS_DB`.`Transcript` (`tid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TranscriptToDataset_dataset`
    FOREIGN KEY (`datasetID`)
    REFERENCES `CHESS_DB`.`Dataset` (`datasetID`)
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
  `transcript_id` VARCHAR(50) CHARACTER SET 'ascii' NOT NULL,
  `start` INT UNSIGNED NOT NULL COMMENT 'prime3 and prime5 (3\\\' and 5\\\') are coordinates specific to the version of the transcript on this particular source',
  `end` INT UNSIGNED NOT NULL COMMENT 'start and end (5\\\' and 3\\\') are coordinates specific to the version of the transcript on this particular source.\\nThe main entry for the tid in Transcripts extends to the farthest ends of referencing transcripts.',
  `score` SMALLINT UNSIGNED NULL DEFAULT NULL,
  `type_key` VARCHAR(45) NOT NULL,
  `type_value` VARCHAR(45) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `cds_start` INT UNSIGNED NULL,
  `cds_end` INT UNSIGNED NULL,
  `gid` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`tid`, `sourceID`),
  INDEX `fk_TxDBXREF_source_idx` (`sourceID` ASC) VISIBLE,
  INDEX `fk_TxDBXREF_type_idx` (`type_key` ASC, `type_value` ASC) VISIBLE,
  INDEX `fk_TxDBXREF_gene_idx` (`sourceID` ASC, `gid` ASC) VISIBLE,
  CONSTRAINT `fk_TxDBXREF_tid`
    FOREIGN KEY (`tid`)
    REFERENCES `CHESS_DB`.`Transcript` (`tid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_TxDBXREF_source`
    FOREIGN KEY (`sourceID`)
    REFERENCES `CHESS_DB`.`Sources` (`sourceID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_TxDBXREF_type`
    FOREIGN KEY (`type_key` , `type_value`)
    REFERENCES `CHESS_DB`.`AttributeValueMap` (`key_name` , `og_value`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TxDBXREF_gene`
    FOREIGN KEY (`sourceID` , `gid`)
    REFERENCES `CHESS_DB`.`Gene` (`sourceID` , `gid`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'This table is used to build a transcript map between sources.\\nFor a transcript we can tell all sources and corresponding ID for each along with additional information that may vary from source to source.\\nWhile the Transcripts table provides a high-level overview of the transcripts, deduplicating many entries and hiding some of the information';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`TXAttribute`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`TXAttribute` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`TXAttribute` (
  `tid` INT UNSIGNED NOT NULL,
  `sourceID` INT UNSIGNED NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `value` VARCHAR(45) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL DEFAULT '',
  `value_text` TEXT NULL,
  `key_text` VARCHAR(45) NOT NULL COMMENT 'The original value of the key. This is done to bypass key duplications. when two synonymous keys with the same value appear within the same source for the same transcript. This needs to be reimplemented in the future.',
  PRIMARY KEY (`tid`, `sourceID`, `name`, `value`, `key_text`),
  INDEX `fk_TXAttribute_attr_idx` (`name` ASC, `value` ASC) VISIBLE,
  CONSTRAINT `fk_Attributes_tidsource`
    FOREIGN KEY (`tid` , `sourceID`)
    REFERENCES `CHESS_DB`.`TxDBXREF` (`tid` , `sourceID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TXAttribute_attr`
    FOREIGN KEY (`name` , `value`)
    REFERENCES `CHESS_DB`.`AttributeValueMap` (`key_name` , `og_value`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Table listing all possible attribute keys stored across all datasets.\\nAutoupdates timestamps in the transcripts on insert/update via triggers.';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`SequenceIDMap`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`SequenceIDMap` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`SequenceIDMap` (
  `assemblyID` INT UNSIGNED NOT NULL,
  `sequenceID` INT UNSIGNED NOT NULL COMMENT 'sequenceID must always be convertible to INT',
  `nomenclature` VARCHAR(45) NOT NULL COMMENT 'name of the nomenclature',
  `sequenceName` VARCHAR(45) NOT NULL COMMENT 'another name for the name',
  PRIMARY KEY (`assemblyID`, `sequenceID`, `nomenclature`),
  CONSTRAINT `fk_SequenceIDMap_assembly`
    FOREIGN KEY (`assemblyID` , `sequenceID`)
    REFERENCES `CHESS_DB`.`SequenceID` (`assemblyID` , `sequenceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Conversion table between different nomenclatures of the same assembly.\\nProvides a map between different names of the same sequence on the same assembly.';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Configurations`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Configurations` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Configurations` (
  `configuration_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nomenclature` VARCHAR(45) NULL DEFAULT NULL,
  `has_cds` TINYINT NULL DEFAULT NULL,
  `name` VARCHAR(45) NOT NULL,
  `description` TEXT NOT NULL,
  PRIMARY KEY (`configuration_id`),
  UNIQUE INDEX `configuration_id_UNIQUE` (`configuration_id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB
COMMENT = 'This table contains ready-to-use configurations which can be immediately transformed into a set of files.\\nThe simplest configuration would be to describe each source as it appeared in the input.\\nBut more sophisticated configurations can be created.';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Configuration_SourcesExclude`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Configuration_SourcesExclude` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Configuration_SourcesExclude` (
  `configuration_id` INT UNSIGNED NOT NULL,
  `sourceID` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`configuration_id`, `sourceID`),
  INDEX `fk_Configuration_SourcesExclude_source_id_idx` (`sourceID` ASC) VISIBLE,
  CONSTRAINT `fk_Configuration_SourcesExclude_configuration_id`
    FOREIGN KEY (`configuration_id`)
    REFERENCES `CHESS_DB`.`Configurations` (`configuration_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Configuration_SourcesExclude_source_id`
    FOREIGN KEY (`sourceID`)
    REFERENCES `CHESS_DB`.`Sources` (`sourceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'This table links configuration to which sources are to be included in the configuration\\nThe following values can be set:\\n';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Configuration_TranscriptTypes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Configuration_TranscriptTypes` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Configuration_TranscriptTypes` (
  `configuration_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`configuration_id`, `type`),
  CONSTRAINT `fk_Configuration_TranscriptTypes_configuration_id`
    FOREIGN KEY (`configuration_id`)
    REFERENCES `CHESS_DB`.`Configurations` (`configuration_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Configuration_GeneTypes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Configuration_GeneTypes` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Configuration_GeneTypes` (
  `configuration_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`configuration_id`, `type`),
  CONSTRAINT `fk_Configuration_GeneTypes_configuration_id`
    FOREIGN KEY (`configuration_id`)
    REFERENCES `CHESS_DB`.`Configurations` (`configuration_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Configuration_Datasets`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Configuration_Datasets` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Configuration_Datasets` (
  `ConfigurationSource` INT NOT NULL,
  PRIMARY KEY (`ConfigurationSource`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Configuration_SourcesInclude`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Configuration_SourcesInclude` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Configuration_SourcesInclude` (
  `configuration_id` INT UNSIGNED NOT NULL,
  `sourceID` INT UNSIGNED NOT NULL,
  `rank` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`configuration_id`, `sourceID`),
  INDEX `fk_Configuration_SourcesInclude_source_id_idx` (`sourceID` ASC) VISIBLE,
  CONSTRAINT `fk_Configuration_SourcesInclude_configuration_id`
    FOREIGN KEY (`configuration_id`)
    REFERENCES `CHESS_DB`.`Configurations` (`configuration_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Configuration_SourcesInclude_source_id`
    FOREIGN KEY (`sourceID`)
    REFERENCES `CHESS_DB`.`Sources` (`sourceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'This table links configuration to which sources are to be included in the configuration\\nThe following values can be set:\\n';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`AttributeKeyMap`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`AttributeKeyMap` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`AttributeKeyMap` (
  `og_key` VARCHAR(45) NOT NULL,
  `std_key` VARCHAR(45) NOT NULL,
  UNIQUE INDEX `og_key_UNIQUE` (`og_key` ASC) VISIBLE,
  PRIMARY KEY (`og_key`),
  INDEX `fk_AttributeKeyMap_key_idx` (`std_key` ASC) VISIBLE,
  CONSTRAINT `fk_AttributeKeyMap_key`
    FOREIGN KEY (`std_key`)
    REFERENCES `CHESS_DB`.`AttributeKey` (`key_name`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Map linking various names to a standard set of attribute keys';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`Intron`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`Intron` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`Intron` (
  `iid` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyID` INT UNSIGNED NOT NULL,
  `sequenceID` INT UNSIGNED NOT NULL,
  `strand` VARCHAR(45) NOT NULL,
  `start` VARCHAR(45) NOT NULL,
  `end` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`iid`),
  UNIQUE INDEX `unique_intron_coordinates` (`sequenceID` ASC, `strand` ASC, `assemblyID` ASC, `start` ASC, `end` ASC) VISIBLE,
  INDEX `fk_Intron_sequence_idx` (`assemblyID` ASC, `sequenceID` ASC) VISIBLE,
  CONSTRAINT `fk_Intron_sequence`
    FOREIGN KEY (`assemblyID` , `sequenceID`)
    REFERENCES `CHESS_DB`.`SequenceID` (`assemblyID` , `sequenceID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CHESS_DB`.`TranscriptToIntron`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`TranscriptToIntron` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`TranscriptToIntron` (
  `tid` INT UNSIGNED NOT NULL,
  `iid` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`tid`, `iid`),
  INDEX `fk_TranscriptToIntron_iid_idx` (`iid` ASC) VISIBLE,
  CONSTRAINT `fk_TranscriptToIntron_tid`
    FOREIGN KEY (`tid`)
    REFERENCES `CHESS_DB`.`Transcript` (`tid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TranscriptToIntron_iid`
    FOREIGN KEY (`iid`)
    REFERENCES `CHESS_DB`.`Intron` (`iid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Maps introns to individual transcripts. Many-to-many. Used to extract intron chains for each transcript';


-- -----------------------------------------------------
-- Table `CHESS_DB`.`IntronToDataset`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CHESS_DB`.`IntronToDataset` ;

CREATE TABLE IF NOT EXISTS `CHESS_DB`.`IntronToDataset` (
  `iid` INT UNSIGNED NOT NULL,
  `datasetID` INT UNSIGNED NOT NULL,
  `coverage` INT NULL,
  `conservation` INT NULL,
  PRIMARY KEY (`iid`, `datasetID`),
  INDEX `fk_IntronToDataset_dataset_idx` (`datasetID` ASC) VISIBLE,
  CONSTRAINT `fk_IntronToDataset_intron`
    FOREIGN KEY (`iid`)
    REFERENCES `CHESS_DB`.`Intron` (`iid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_IntronToDataset_dataset`
    FOREIGN KEY (`datasetID`)
    REFERENCES `CHESS_DB`.`Dataset` (`datasetID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `CHESS_DB`;

DELIMITER $$

USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`Transcript_checkCoordinates_BEFORE_INSERT` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`Transcript_checkCoordinates_BEFORE_INSERT` BEFORE INSERT ON `Transcript` FOR EACH ROW
BEGIN
	-- Verifies validity of coordinates
    -- Check that sequenceID is valid for the given assembly
    -- Checks that coordinates are within bounds for that sequence
    -- Checks that start < end
    DECLARE sequenceCount INT;
    DECLARE sequenceLength INT;
    
    SELECT COUNT(*) INTO sequenceCount
    FROM SequenceID
    WHERE assemblyID = NEW.assemblyID AND sequenceID = NEW.sequenceID;
    
    IF sequenceCount = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SequenceID does not exist for the specified assembly';
    END IF;
    
    IF sequenceCount > 0 THEN
        SELECT length INTO sequenceLength
        FROM SequenceID
        WHERE assemblyID = NEW.assemblyID AND sequenceID = NEW.sequenceID;
        
        IF NEW.start >= NEW.end THEN
			SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'start >= end';
		END IF;
        
        IF NEW.start < 1 OR NEW.start > sequenceLength OR NEW.end > sequenceLength THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Start and/or end coordinates are out of bounds for the specified sequence';
        END IF;
    END IF;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TX_AI_Sources_lastUpdated` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TX_AI_Sources_lastUpdated` AFTER INSERT ON `Transcript` FOR EACH ROW
BEGIN
	-- 'propagates lastUpdated to the Source through dbxref'
    UPDATE Sources
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE sourceID IN (SELECT sourceID FROM TxDBXREF WHERE tid = NEW.tid);
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`Transcript_checkCoordinates_BEFORE_UPDATE` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`Transcript_checkCoordinates_BEFORE_UPDATE` BEFORE UPDATE ON `Transcript` FOR EACH ROW
BEGIN
	-- Verifies validity of coordinates
    -- Check that sequenceID is valid for the given assembly
    -- Checks that coordinates are within bounds for that sequence
    -- Checks that start < end
    DECLARE sequenceCount INT;
    DECLARE sequenceLength INT;
    
    SELECT COUNT(*) INTO sequenceCount
    FROM SequenceID
    WHERE assemblyID = NEW.assemblyID AND sequenceID = NEW.sequenceID;
    
    IF sequenceCount = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SequenceID does not exist for the specified assembly';
    END IF;
    
    IF sequenceCount > 0 THEN
        SELECT length INTO sequenceLength
        FROM SequenceID
        WHERE assemblyID = NEW.assemblyID AND sequenceID = NEW.sequenceID;
        
        IF NEW.start >= NEW.end THEN
			SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'start >= end';
		END IF;
        
        IF NEW.start < 1 OR NEW.start > sequenceLength OR NEW.end > sequenceLength THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Start and/or end coordinates are out of bounds for the specified sequence';
        END IF;
    END IF;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`update_sources_lastUpdated_after_update_in_Transcript` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`update_sources_lastUpdated_after_update_in_Transcript` AFTER UPDATE ON `Transcript` FOR EACH ROW
BEGIN
	-- 'propagates lastUpdated to the Source through dbxref'
    UPDATE Sources
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE sourceID IN (SELECT sourceID FROM TxDBXREF WHERE tid = NEW.tid);
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`update_sources_lastUpdated_after_delete_in_Transcript` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`update_sources_lastUpdated_after_delete_in_Transcript` AFTER DELETE ON `Transcript` FOR EACH ROW
BEGIN
	-- 'propagates lastUpdated to the Source through dbxref'
    UPDATE Sources
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE sourceID IN (SELECT sourceID FROM TxDBXREF WHERE tid = OLD.tid);
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`AttributeKey_AI` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`AttributeKey_AI` AFTER INSERT ON `AttributeKey` FOR EACH ROW
BEGIN
	IF NEW.variable = 1 THEN
		-- Insert into AttributeKeyValue
		INSERT INTO AttributeKeyValue (key_name, value) VALUES (NEW.key_name, '');
		-- Insert into AttributeValueMap
		INSERT INTO AttributeValueMap (key_name, og_value, std_value) VALUES (NEW.key_name, '', '');
	END IF;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`AttributeKey_BEFORE_UPDATE` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`AttributeKey_BEFORE_UPDATE` BEFORE UPDATE ON `AttributeKey` FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
	SET MESSAGE_TEXT = 'Manually updating "variable" is disallowed';
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`AttributeKeyValue_BEFORE_INSERT` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`AttributeKeyValue_BEFORE_INSERT` BEFORE INSERT ON `AttributeKeyValue` FOR EACH ROW
BEGIN
-- 1). Before insert into the values table, if the corresponding key has variable set to 1 
-- then value must be set to empty string ''. 
-- 2) before insert into the values table if the corresponding key has variable set to 0 
-- then there can not be an entry with NULL in value.
	DECLARE v_variable TINYINT;
    
    -- Get the variable value for the corresponding key
    SELECT `variable` INTO v_variable
    FROM `AttributeKey`
    WHERE `key_name` = NEW.`key_name`;
    
    -- Check conditions based on the variable value
    IF v_variable = 1 THEN
        -- If variable is 1, set og_value and std_value to NULL
        SET NEW.`value` = '', NEW.`value` = '';
    ELSE
        -- If variable is 0, ensure neither og_value nor std_value is NULL
        IF NEW.`value` = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid values for og_value or std_value';
        END IF;
    END IF;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`AttributeValueMap_BI` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`AttributeValueMap_BI` BEFORE INSERT ON `AttributeValueMap` FOR EACH ROW
BEGIN
-- 1). Before insert into the values table, if the corresponding key has variable set to 1 
-- then both og_value and std_value must be set to empty string ''. 
-- 2) before insert into the values table if the corresponding key has variable set to 0 
-- then there can not be an entry with NULL in either og_value or std_value or both.
	DECLARE v_variable TINYINT;
    
    -- Get the variable value for the corresponding key
    SELECT `variable` INTO v_variable
    FROM `AttributeKey`
    WHERE `key_name` = NEW.`key_name`;
    
    -- Check conditions based on the variable value
    IF v_variable = 1 THEN
        -- If variable is 1, set og_value and std_value to NULL
        SET NEW.`og_value` = '', NEW.`std_value` = '';
    ELSE
        -- If variable is 0, ensure neither og_value nor std_value is NULL
        IF NEW.`og_value` = '' OR NEW.`std_value` = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid values for og_value or std_value';
        END IF;
    END IF;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TxDBXREF_setEnds_AFTER_INSERT` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TxDBXREF_setEnds_AFTER_INSERT` AFTER INSERT ON `TxDBXREF` FOR EACH ROW
BEGIN
	-- updates record for the tid in Transcripts to extend towards the farthest 3' and 5' ends
    UPDATE Transcript
    SET start = LEAST(NEW.start, (SELECT * FROM (SELECT start FROM Transcript WHERE tid = NEW.tid) as TranscriptStart)),
        end = GREATEST(NEW.end, (SELECT * FROM (SELECT end FROM Transcript WHERE tid = NEW.tid) as TranscriptEnd))
    WHERE tid = NEW.tid;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TxDBXREF_AFTER_INSERT_Locus` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TxDBXREF_AFTER_INSERT_Locus` AFTER INSERT ON `TxDBXREF` FOR EACH ROW
BEGIN
    DECLARE locus_start INT UNSIGNED;
    DECLARE locus_end INT UNSIGNED;

    -- Retrieve the current start and end values from the Locus table
    SELECT start, end INTO locus_start, locus_end
    FROM `CHESS_DB`.`Locus`
    WHERE lid = (
        SELECT lid
        FROM `CHESS_DB`.`Gene`
        WHERE gid = NEW.gid
        LIMIT 1
    );

    -- Update the Locus entry
    UPDATE `CHESS_DB`.`Locus`
    SET start = LEAST(locus_start, NEW.start),
        end = GREATEST(locus_end, NEW.end)
    WHERE lid = (
        SELECT lid
        FROM `CHESS_DB`.`Gene`
        WHERE gid = NEW.gid
        LIMIT 1
    );
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TxDBXREF_setEnds_AFTER_UPDATE` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TxDBXREF_setEnds_AFTER_UPDATE` AFTER UPDATE ON `TxDBXREF` FOR EACH ROW
BEGIN
	-- updates record for the tid in Transcripts to extend towards the farthest 3' and 5' ends
    DECLARE min_start INT;
    DECLARE max_end INT;

    SELECT MAX(end) INTO max_end
    FROM TxDBXREF
    WHERE tid = NEW.tid;
    
    SELECT MIN(start) INTO min_start
    FROM TxDBXREF
    WHERE tid = NEW.tid;

    UPDATE Transcript
    SET end = max_end
    WHERE tid = NEW.tid;
    
    UPDATE Transcript
    SET start = min_start
    WHERE tid = NEW.tid;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TxDBXREF_AFTER_DELETE_Locus` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TxDBXREF_AFTER_DELETE_Locus` AFTER DELETE ON `TxDBXREF` FOR EACH ROW
BEGIN
	-- Update the corresponding Locus entry after a TxDBXREF deletion
    UPDATE `CHESS_DB`.`Locus`
    SET start = (
            SELECT MIN(start)
            FROM `CHESS_DB`.`TxDBXREF`
            WHERE gid = OLD.gid
        ),
        end = (
            SELECT MAX(end)
            FROM `CHESS_DB`.`TxDBXREF`
            WHERE gid = OLD.gid
        )
    WHERE lid = (
        SELECT lid
        FROM `CHESS_DB`.`Gene`
        WHERE gid = OLD.gid
        LIMIT 1
    );
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TxDBXREF_AFTER_UPDATE_locus` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TxDBXREF_AFTER_UPDATE_locus` AFTER UPDATE ON `TxDBXREF` FOR EACH ROW
BEGIN
	-- Update the corresponding Locus entry after a TxDBXREF update
    UPDATE `CHESS_DB`.`Locus`
    SET start = (
            SELECT MIN(start)
            FROM `CHESS_DB`.`TxDBXREF`
            WHERE gid = NEW.gid
        ),
        end = (
            SELECT MAX(end)
            FROM `CHESS_DB`.`TxDBXREF`
            WHERE gid = NEW.gid
        )
    WHERE lid = (
        SELECT lid
        FROM `CHESS_DB`.`Gene`
        WHERE gid = NEW.gid
        LIMIT 1
    );
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TXAttributes_BI` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TXAttributes_BI` BEFORE INSERT ON `TXAttribute` FOR EACH ROW
BEGIN
-- Check that one and only one of the "value" and "value_text" is set to empty string ''. 
-- Only one of these two fields can have a value. 
-- This is determined by the key - if the key has "variable" field set to 1, 
-- then "value_text" has to have proper value and "value" should be set to empty string ''. 
-- Otherwise, "value" needs to be set and "value_text" set to empty string ''
	DECLARE v_variable TINYINT;

    -- Get the variable value for the corresponding key
    SELECT `variable` INTO v_variable 
    FROM `AttributeKey` k 
    JOIN AttributeKeyMap m 
    ON k.`key_name`=m.`std_key` 
    WHERE m.`og_key` = NEW.`name`;

    -- Check conditions based on the variable value
    IF v_variable = 1 THEN
        -- If variable is 1, value_text must have a value, and value should be empty string ''
        IF NEW.`value` != '' OR NEW.`value_text` = '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid values for value and value_text based on key variable setting';
        END IF;
    ELSE
        -- If variable is 0, value must have a value, and value_text should be empty string ''
        IF NEW.`value` = '' OR NEW.`value_text` != '' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid values for value and value_text based on key variable setting';
        END IF;
    END IF;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TXAttribute_AI` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TXAttribute_AI` AFTER INSERT ON `TXAttribute` FOR EACH ROW
BEGIN
	UPDATE Transcript
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE tid = NEW.tid;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TXAttribute_AU` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TXAttribute_AU` AFTER UPDATE ON `TXAttribute` FOR EACH ROW
BEGIN
    UPDATE Transcript
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE tid = NEW.tid;
END$$


USE `CHESS_DB`$$
DROP TRIGGER IF EXISTS `CHESS_DB`.`TXAttribute_AD` $$
USE `CHESS_DB`$$
CREATE DEFINER = CURRENT_USER TRIGGER `CHESS_DB`.`TXAttribute_AD` AFTER DELETE ON `TXAttribute` FOR EACH ROW
BEGIN
	UPDATE Transcript
    SET lastUpdated = CURRENT_TIMESTAMP
    WHERE tid = OLD.tid;
END$$


DELIMITER ;
SET SQL_MODE = '';
DROP USER IF EXISTS chess_master;
SET SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
CREATE USER 'chess_master' IDENTIFIED BY 'qwerty';

GRANT ALL ON `default_schema`.* TO 'chess_master';
GRANT ALL ON `CHESS_DB`.* TO 'chess_master';

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
