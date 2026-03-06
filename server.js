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

// --- TRANSACTIONS ---

app.post('/api/pay', async (req, res) => {
  const { amount, recipient } = req.body;
  
  try {
    // 1. Check if recipient is a Trusted Contact
    const trustedCheck = await pool.query('SELECT * FROM trusted_contacts WHERE name = $1', [recipient]);
    const isTrusted = trustedCheck.rows.length > 0;

    // 2. Risk Logic: High risk if > $500 and NOT trusted
    const riskScore = (amount > 500 && !isTrusted) ? 90 : 10;
    const status = riskScore > 80 ? 'PENDING' : 'SUCCESS';

    const result = await pool.query(
      'INSERT INTO transactions (amount, recipient, risk_score, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [amount, recipient, riskScore, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update transaction status (Approve/Reject)
app.post('/api/approve', async (req, res) => {
    const { id, action } = req.body; // action: 'SUCCESS' or 'REJECTED'
    const result = await pool.query(
        'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
        [action, id]
    );
    res.json(result.rows[0]);
});

app.get('/api/history', async (req, res) => {
  const result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
  res.json(result.rows);
});

// --- TRUSTED CONTACTS ---

app.get('/api/trusted', async (req, res) => {
    const result = await pool.query('SELECT * FROM trusted_contacts');
    res.json(result.rows);
});

app.post('/api/trusted', async (req, res) => {
    const { name } = req.body;
    await pool.query('INSERT INTO trusted_contacts (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
    res.json({ success: true });
});

app.listen(process.env.PORT || 3001, () => console.log('Guardian Backend Active'));
