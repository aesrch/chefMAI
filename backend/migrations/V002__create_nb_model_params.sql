-- V002: Create nb_model_params table
-- Stores Naive Bayes classifier parameters (trained model)

CREATE TABLE IF NOT EXISTS nb_model_params (
    param_id      VARCHAR(20) PRIMARY KEY,
    feature_name  VARCHAR(100) NOT NULL,
    class_label   VARCHAR(20) NOT NULL,
    probability   DOUBLE NOT NULL,
    total_samples INT DEFAULT 0,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_feature_class (feature_name, class_label)
);
