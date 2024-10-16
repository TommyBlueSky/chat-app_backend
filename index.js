// backend/index.js
require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // JSONの受信を許可

// MySQLの接続設定（本番公開時には.envファイルに書き換える）
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'chat_app',
    charset: 'utf8mb4'
});

// MySQLへの接続
db.connect(err => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('MySQL connected!');
});

// メッセージの取得
app.get('/messages', (req, res) => {
    db.query('SELECT * FROM messages ORDER BY created_at DESC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// メッセージの作成
app.post('/messages', (req, res) => {
  const { username, message } = req.body;
  db.query('INSERT INTO messages (username, message) VALUES (?, ?)', [username, message], (err, result) => {
      if (err) {
          return res.status(500).json(err);
      }
      res.json({ id: result.insertId, username, message });
  });
});

// メッセージの更新
app.put('/messages/:id', (req, res) => {
  const { id } = req.params;
  const { username, message } = req.body;
  db.query('UPDATE messages SET username = ?, message = ? WHERE id = ?', [username, message, id], (err) => {
      if (err) {
          return res.status(500).json(err);
      }
      res.json({ id, username, message });
  });
});

// メッセージの削除
app.delete('/messages/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM messages WHERE id = ?', [id], (err) => {
      if (err) {
          return res.status(500).json(err);
      }
      res.sendStatus(204); // No Content
  });
});

// サーバーを起動
const PORT = 5000;
app.listen(process.env.PORT || PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});