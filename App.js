import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "YOUR_RENDER_URL_HERE/api"; // Replace after deploying backend

function App() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [history, setHistory] = useState([]);

  const handlePayment = async () => {
    const res = await axios.post(`${API_URL}/pay`, { amount, recipient });
    alert(`Status: ${res.data.status} (Risk Score: ${res.data.risk_score})`);
    loadHistory();
  };

  const loadHistory = async () => {
    const res = await axios.get(`${API_URL}/history`);
    setHistory(res.data);
  };

  useEffect(() => { loadHistory(); }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>GuardianWallet 🛡️</h1>
      <input placeholder="Amount" onChange={e => setAmount(e.target.value)} />
      <input placeholder="Recipient Name" onChange={e => setRecipient(e.target.value)} />
      <button onClick={handlePayment}>Send Money</button>

      <h3>Activity Log</h3>
      {history.map(t => (
        <div key={t.id} style={{ color: t.status === 'FLAGGED' ? 'red' : 'green' }}>
          ${t.amount} to {t.recipient} - <strong>{t.status}</strong>
        </div>
      ))}
    </div>
  );
}

export default App;