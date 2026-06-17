-- V003: Create user_preferences table
-- Tracks Bayesian user preference learning signals

CREATE TABLE IF NOT EXISTS user_preferences (
    pref_id       VARCHAR(20) PRIMARY KEY,
    acc_id        VARCHAR(20) NOT NULL,
    rcp_id        VARCHAR(20),
    genre         VARCHAR(100),
    interaction   ENUM('view', 'cook', 'like', 'dislike', 'save', 'rate') NOT NULL,
    rating_value  INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (acc_id) REFERENCES acctable(accID),
    FOREIGN KEY (rcp_id) REFERENCES rcptable(rcpID),
    INDEX idx_user_pref (acc_id, interaction),
    INDEX idx_rcp_pref (rcp_id)
);
