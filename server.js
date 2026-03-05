const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Mock Security Logic: Flag transactions over $500 as high risk
app.post('/api/pay', async (req, res) => {
  const { amount, recipient } = req.body;
  const riskScore = amount > 500 ? 85 : 10;
  const status = riskScore > 80 ? 'FLAGGED' : 'SUCCESS';

  try {
    const result = await pool.query(
      'INSERT INTO transactions (amount, recipient, risk_score, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [amount, recipient, riskScore, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/history', async (req, res) => {
  const result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
  res.json(result.rows);
});

app.listen(process.env.PORT || 3001, () => console.log('Guardian Backend Active'));