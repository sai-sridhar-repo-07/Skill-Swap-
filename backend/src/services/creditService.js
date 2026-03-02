const { getClient, query } = require('../config/postgres');
const { AppError } = require('../utils/errors');
const { logger } = require('../utils/logger');

const TRANSACTION_TYPES = {
  SIGNUP_BONUS: 'signup_bonus',
  BOOKING: 'booking',
  TEACHING: 'teaching',
  REFUND: 'refund',
  ADMIN_ADJUST: 'admin_adjust',
};

const initializeLedger = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS credit_ledger (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      from_user VARCHAR(255),
      to_user VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      session_id VARCHAR(255),
      type VARCHAR(50) NOT NULL,
      note TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_credit_ledger_to_user ON credit_ledger(to_user);
    CREATE INDEX IF NOT EXISTS idx_credit_ledger_from_user ON credit_ledger(from_user);
    CREATE INDEX IF NOT EXISTS idx_credit_ledger_session ON credit_ledger(session_id);
    CREATE INDEX IF NOT EXISTS idx_credit_ledger_created ON credit_ledger(created_at DESC);
  `);
  logger.info('Credit ledger table initialized');
};

const getBalance = async (userId) => {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) as balance FROM credit_ledger WHERE to_user = $1`,
    [userId.toString()]
  );
  return parseFloat(result.rows[0].balance);
};

const getBalanceFull = async (userId) => {
  const result = await query(
    `SELECT 
      COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_earned,
      COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as total_spent,
      COALESCE(SUM(amount), 0) as balance
    FROM credit_ledger WHERE to_user = $1 OR from_user = $1`,
    [userId.toString()]
  );
  return result.rows[0];
};

const addCredits = async (userId, amount, type, sessionId = null, note = null, client = null) => {
  const db = client || { query: (text, params) => query(text, params) };
  const result = await db.query(
    `INSERT INTO credit_ledger (to_user, amount, type, session_id, note)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId.toString(), amount, type, sessionId?.toString(), note]
  );
  return result.rows[0];
};

const deductCredits = async (userId, amount, type, sessionId = null, note = null, client = null) => {
  const db = client || { query: (text, params) => query(text, params) };
  
  const balanceCheck = await db.query(
    `SELECT COALESCE(SUM(amount), 0) as balance FROM credit_ledger WHERE to_user = $1`,
    [userId.toString()]
  );
  const currentBalance = parseFloat(balanceCheck.rows[0].balance);
  
  if (currentBalance < amount) {
    throw new AppError(`Insufficient credits. Balance: ${currentBalance}, Required: ${amount}`, 400);
  }
  
  const result = await db.query(
    `INSERT INTO credit_ledger (from_user, to_user, amount, type, session_id, note)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId.toString(), userId.toString(), -amount, type, sessionId?.toString(), note]
  );
  return result.rows[0];
};

const transferCredits = async (fromUserId, toUserId, amount, sessionId, type = TRANSACTION_TYPES.TEACHING) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    const balanceCheck = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as balance FROM credit_ledger WHERE to_user = $1 FOR UPDATE`,
      [fromUserId.toString()]
    );
    const balance = parseFloat(balanceCheck.rows[0].balance);
    
    if (balance < amount) {
      await client.query('ROLLBACK');
      throw new AppError(`Insufficient credits. Balance: ${balance}`, 400);
    }
    
    await client.query(
      `INSERT INTO credit_ledger (from_user, to_user, amount, type, session_id, note)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [fromUserId.toString(), fromUserId.toString(), -amount, 'booking', sessionId?.toString(), 'Session booking deduction']
    );
    
    await client.query(
      `INSERT INTO credit_ledger (from_user, to_user, amount, type, session_id, note)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [fromUserId.toString(), toUserId.toString(), amount, type, sessionId?.toString(), 'Teaching credit earned']
    );
    
    await client.query('COMMIT');
    logger.info(`Credits transferred: ${amount} from ${fromUserId} to ${toUserId} for session ${sessionId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getTransactionHistory = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT * FROM credit_ledger 
     WHERE to_user = $1 OR from_user = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId.toString(), limit, offset]
  );
  const countResult = await query(
    `SELECT COUNT(*) FROM credit_ledger WHERE to_user = $1 OR from_user = $1`,
    [userId.toString()]
  );
  return {
    transactions: result.rows,
    total: parseInt(countResult.rows[0].count),
    page, limit,
  };
};

const refundCredits = async (userId, amount, sessionId, note) => {
  return addCredits(userId, amount, TRANSACTION_TYPES.REFUND, sessionId, note);
};

const signupBonus = async (userId) => {
  const bonusAmount = parseInt(process.env.SIGNUP_BONUS_CREDITS) || 10;
  return addCredits(userId, bonusAmount, TRANSACTION_TYPES.SIGNUP_BONUS, null, 'Welcome bonus credits');
};

module.exports = {
  TRANSACTION_TYPES,
  initializeLedger,
  getBalance,
  getBalanceFull,
  addCredits,
  deductCredits,
  transferCredits,
  getTransactionHistory,
  refundCredits,
  signupBonus,
};
