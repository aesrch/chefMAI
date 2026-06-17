-- V004: Create recommendation_logs table
-- Logs each recommendation for performance evaluation

CREATE TABLE IF NOT EXISTS recommendation_logs (
    log_id              VARCHAR(20) PRIMARY KEY,
    acc_id              VARCHAR(20) NOT NULL,
    rcp_id              VARCHAR(20) NOT NULL,
    ingredient_match    DOUBLE NOT NULL,
    nb_suitability      DOUBLE NOT NULL,
    preference_score    DOUBLE NOT NULL,
    final_score         DOUBLE NOT NULL,
    user_feedback       ENUM('accepted', 'rejected', 'cooked', 'ignored') DEFAULT 'ignored',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (acc_id) REFERENCES acctable(accID),
    FOREIGN KEY (rcp_id) REFERENCES rcptable(rcpID),
    INDEX idx_log_user (acc_id),
    INDEX idx_log_time (created_at)
);
