const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const ACCOUNT_URL = process.env.ACCOUNT_URL || 'http://localhost:8080';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'm347password',
  database: process.env.DB_NAME || 'm347kn08'
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// POST /buy - Buy tbzCoins for a user
app.post('/buy', async (req, res) => {
  try {
    const { id, amount } = req.body;
    const buyAmount = parseInt(amount);

    if (!id || !buyAmount || buyAmount <= 0) {
      return res.json(false);
    }

    const conn = await getConnection();
    await conn.execute('UPDATE users SET amount = amount + ? WHERE id = ?', [buyAmount, id]);
    await conn.end();

    res.json(true);
  } catch (err) {
    console.error('Buy error:', err.message);
    res.json(false);
  }
});

// POST /sell - Sell tbzCoins for a user
app.post('/sell', async (req, res) => {
  try {
    const { id, amount } = req.body;
    const sellAmount = parseInt(amount);

    if (!id || !sellAmount || sellAmount <= 0) {
      return res.json(false);
    }

    const conn = await getConnection();

    // Check current balance
    const [rows] = await conn.execute('SELECT amount FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      await conn.end();
      return res.json(false);
    }

    const current = rows[0].amount;
    const newAmount = Math.max(0, current - sellAmount);

    await conn.execute('UPDATE users SET amount = ? WHERE id = ?', [newAmount, id]);
    await conn.end();

    res.json(true);
  } catch (err) {
    console.error('Sell error:', err.message);
    res.json(false);
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => console.log(`BuySell service running on port ${PORT}`));
