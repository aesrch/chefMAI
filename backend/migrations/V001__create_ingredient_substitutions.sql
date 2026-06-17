-- V001: Create ingredient_substitutions table
-- Smart substitution mappings for ingredients

CREATE TABLE IF NOT EXISTS ingredient_substitutions (
    sub_id          VARCHAR(20) PRIMARY KEY,
    original_name   VARCHAR(100) NOT NULL,
    substitute_name VARCHAR(100) NOT NULL,
    ratio           VARCHAR(50) DEFAULT '1:1',
    notes           TEXT,
    category        VARCHAR(50),
    confidence      DOUBLE DEFAULT 0.8,
    INDEX idx_original (original_name),
    INDEX idx_substitute (substitute_name)
);
