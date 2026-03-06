const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// FIX: Only declare CORS once and use it
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Root route to check if backend is alive
app.get('/', (req, res) => {
  res.send('🛡️ GuardianWallet API is Online and Secure!');
});

// Payment route
app.post('/api/pay', async (req, res) => {
  const { amount, recipient } = req.body;
  // Convert amount to number for logic
  const numericAmount = parseFloat(amount);
  const riskScore = numericAmount > 500 ? 85 : 10;
  const status = riskScore > 80 ? 'FLAGGED' : 'SUCCESS';

  try {
    const result = await pool.query(
      'INSERT INTO transactions (amount, recipient, risk_score, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [numericAmount, recipient, riskScore, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// History route
app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database Error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Guardian Backend Active on port ${PORT}`));
