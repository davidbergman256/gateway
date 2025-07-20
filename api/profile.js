require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const port = 3000;

app.get('/api/profile', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'email param required' });

  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}/registrations`
            + `?filterByFormula=${encodeURIComponent(`{email}="${email}"`)}`;

  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
    });

    const data = await r.json();
    console.log("🔍 Airtable raw response:", data);

    const fields = data.records?.[0]?.fields;

    if (!fields) {
      console.log("⚠️ No records found or missing fields");
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(fields);
  } catch (err) {
    console.error("💣 Caught error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`🔥 Airtable API live at http://localhost:${port}/api/profile`);
});
