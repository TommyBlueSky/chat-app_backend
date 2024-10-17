// backend/index.js
require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || process.env.FRONT_URL.indexOf(origin) !== -1) {
            callback(null, origin);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
    optionsSuccessStatus: 200 //レスポンスstatusを200に設定
}));
app.use(express.json()); // JSONの受信を許可

// MySQLの接続設定（本番公開時には.envファイルに書き換える）
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});