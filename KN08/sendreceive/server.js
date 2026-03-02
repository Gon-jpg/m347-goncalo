const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'm347password',
  database: process.env.DB_NAME || 'm347kn08'
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// POST /send - Send tbzCoins to a friend
app.post('/send', async (req, res) => {
  try {
    const { id, receiverId, amount } = req.body;
    const sendAmount = parseInt(amount);
    const senderId = parseInt(id);
    const recId = parseInt(receiverId);

    if (!senderId || !recId || !sendAmount || sendAmount <= 0) {
      return res.json(false);
    }

    const conn = await getConnection();

    // Check if receiver is a friend
    const [friends] = await conn.execute(
      'SELECT * FROM friends WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)',
      [senderId, recId, recId, senderId]
    );

    if (friends.length === 0) {
      await conn.end();
      return res.json(false);
    }

    // Check sender balance
    const [senderRows] = await conn.execute('SELECT amount FROM users WHERE id = ?', [senderId]);
    if (senderRows.length === 0 || senderRows[0].amount < sendAmount) {
      await conn.end();
      return res.json(false);
    }

    // Transfer: deduct from sender, add to receiver
    await conn.execute('UPDATE users SET amount = amount - ? WHERE id = ?', [sendAmount, senderId]);
    await conn.execute('UPDATE users SET amount = amount + ? WHERE id = ?', [sendAmount, recId]);
    await conn.end();

    res.json(true);
  } catch (err) {
    console.error('Send error:', err.message);
    res.json(false);
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 8003;
app.listen(PORT, () => console.log(`SendReceive service running on port ${PORT}`));
