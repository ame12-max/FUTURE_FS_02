const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  findByUsername: async (username) => {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },
  create: async (username, plainPassword) => {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    return result.insertId;
  }
};

module.exports = User;