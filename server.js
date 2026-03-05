const cors = require('cors');
app.use(cors()); // This tells the server: "It's okay to accept requests from my website"
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
app.get('/', (req, res) => {
  res.send('🛡️ GuardianWallet API is Online and Secure!');
});
// This tells your server to show your HTML/React file when someone visits the URL
app.get('*', (req, res) => {
  res.send(`
    <html>
      <head><title>Guardian Wallet</title></head>
      <body>
        <div id="root"></div>
        <script>
           // Your Frontend code logic goes here or 
           // just keep your App.js code as is if you are using a simple script tag
        </script>
        <h1>GuardianWallet 🛡️</h1>
        <p>System Status: Active</p>
        </body>
    </html>
  `);
});
app.listen(process.env.PORT || 3001, () => console.log('Guardian Backend Active'));
