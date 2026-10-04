const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const getAdminEmail = require('../config/adminEmail');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, address = '', password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === getAdminEmail()) {
      return res.status(403).json({ message: 'This email is reserved for the administrator account.' });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name,email,password_hash,address,role) VALUES (?,?,?,?,?)',
      [name, normalizedEmail, hash, address, 'USER']
    );
    res.status(201).json({ message: 'Signup successful' });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email=?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role },
      process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (e) { next(e); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    await db.query('UPDATE users SET password_hash=? WHERE id=?', [hash, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (e) { next(e); }
};