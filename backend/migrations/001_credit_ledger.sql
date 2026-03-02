-- Credit Ledger Migration
-- PostgreSQL schema for financial-grade credit tracking

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user VARCHAR(255),
    to_user VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    session_id VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'signup_bonus', 'booking', 'teaching', 'refund', 'admin_adjust'
    )),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_ledger_to_user ON credit_ledger(to_user);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_from_user ON credit_ledger(from_user);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_session ON credit_ledger(session_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_type ON credit_ledger(type);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created ON credit_ledger(created_at DESC);

-- Balance view for quick lookups
CREATE OR REPLACE VIEW user_balances AS
SELECT 
    to_user as user_id,
    COALESCE(SUM(amount), 0) as balance,
    COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_spent
FROM credit_ledger
GROUP BY to_user;
