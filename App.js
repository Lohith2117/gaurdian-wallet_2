import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:3001/api"; // Replace with your Render URL later

function App() {
  const [view, setView] = useState('senior'); // Toggle: 'senior' or 'guardian'
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [history, setHistory] = useState([]);
  const [trusted, setTrusted] = useState([]);
  const [newTrusted, setNewTrusted] = useState('');

  const loadData = async () => {
    const historyRes = await axios.get(`${API_URL}/history`);
    const trustedRes = await axios.get(`${API_URL}/trusted`);
    setHistory(historyRes.data);
    setTrusted(trustedRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const handlePayment = async () => {
    const res = await axios.post(`${API_URL}/pay`, { amount, recipient });
    if (res.data.status === 'PENDING') {
        alert("Safety Check: This large payment is being held for family review.");
    } else {
        alert("Payment Sent Successfully!");
    }
    loadData();
  };

  const updateStatus = async (id, action) => {
    await axios.post(`${API_URL}/approve`, { id, action });
    loadData();
  };

  const addTrusted = async () => {
    await axios.post(`${API_URL}/trusted`, { name: newTrusted });
    setNewTrusted('');
    loadData();
  };

  const getStatusDisplay = (status) => {
    if (status === 'PENDING') return { text: '⏳ Waiting for Family', color: '#f39c12' };
    if (status === 'REJECTED') return { text: '❌ Canceled for Safety', color: '#e74c3c' };
    return { text: '✅ Success', color: '#27ae60' };
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>GuardianWallet 🛡️</h1>
        <button onClick={() => setView(view === 'senior' ? 'guardian' : 'senior')}>
          Switch to {view === 'senior' ? 'Guardian' : 'Senior'} View
        </button>
      </header>

      <hr />

      {view === 'senior' ? (
        <section>
          <h2>Send Money</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input placeholder="Amount" type="number" onChange={e => setAmount(e.target.value)} />
            <input placeholder="Recipient Name" onChange={e => setRecipient(e.target.value)} />
            <button onClick={handlePayment} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px' }}>Send</button>
          </div>

          <h3>Trusted Contacts (Bypass Limits)</h3>
          <ul>
            {trusted.map(c => <li key={c.id}>{c.name}</li>)}
          </ul>
          <input placeholder="New Trusted Name" value={newTrusted} onChange={e => setNewTrusted(e.target.value)} />
          <button onClick={addTrusted}>Add Member</button>
        </section>
      ) : (
        <section>
          <h2>Caregiver Portal 🔑</h2>
          <p>Review flagged transactions below:</p>
          {history.filter(t => t.status === 'PENDING').map(t => (
            <div key={t.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '8px' }}>
                <strong>${t.amount} to {t.recipient}</strong>
                <div style={{ marginTop: '10px' }}>
                    <button onClick={() => updateStatus(t.id, 'SUCCESS')} style={{ marginRight: '10px', backgroundColor: '#27ae60', color: 'white' }}>Approve</button>
                    <button onClick={() => updateStatus(t.id, 'REJECTED')} style={{ backgroundColor: '#e74c3c', color: 'white' }}>Block</button>
                </div>
            </div>
          ))}
          {history.filter(t => t.status === 'PENDING').length === 0 && <p>All clear! No pending alerts.</p>}
        </section>
      )}

      <h3>Activity Log</h3>
      {history.map(t => {
        const display = getStatusDisplay(t.status);
        return (
          <div key={t.id} style={{ padding: '10px', borderBottom: '1px solid #eee', color: display.color }}>
            <strong>${t.amount}</strong> to {t.recipient} — <em>{display.text}</em>
          </div>
        );
      })}
    </div>
  );
}

export default App;
