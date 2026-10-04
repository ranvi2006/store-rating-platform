const bcrypt = require('bcrypt');
const db = require('../config/db');
const getAdminEmail = require('../config/adminEmail');

const order = (allowed, col, dir, def) =>
  `${allowed.includes(col) ? col : def} ${dir === 'desc' ? 'DESC' : 'ASC'}`;

exports.dashboard = async (req, res, next) => {
  try {
    const [[u]] = await db.query('SELECT COUNT(*) c FROM users');
    const [[s]] = await db.query('SELECT COUNT(*) c FROM stores');
    const [[r]] = await db.query('SELECT COUNT(*) c FROM ratings');
    res.json({ totalUsers: u.c, totalStores: s.c, totalRatings: r.c });
  } catch (e) { next(e); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, address = '', password, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const assignedRole = normalizedEmail === getAdminEmail() ? 'ADMIN' : role;
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name,email,password_hash,address,role) VALUES (?,?,?,?,?)',
      [name, normalizedEmail, hash, address, assignedRole]
    );
    res.status(201).json({
      message: assignedRole === 'ADMIN' && role !== 'ADMIN'
        ? 'Account created as administrator'
        : 'User created',
    });
  } catch (e) { next(e); }
};

exports.createStore = async (req, res, next) => {
  try {
    const { name, email, address = '', ownerId } = req.body;
    const [[owner]] = await db.query("SELECT id FROM users WHERE id=? AND role='OWNER'", [ownerId]);
    if (!owner) return res.status(400).json({ message: 'ownerId must be a Store Owner user' });
    await db.query('INSERT INTO stores (name,email,address,owner_id) VALUES (?,?,?,?)',
      [name, email, address, ownerId]);
    res.status(201).json({ message: 'Store created' });
  } catch (e) { next(e); }
};

exports.listUsers = async (req, res, next) => {
  try {
    const { name = '', email = '', address = '', role = '', sortBy, dir } = req.query;
    let sql = 'SELECT id,name,email,address,role FROM users WHERE name LIKE ? AND email LIKE ? AND address LIKE ?';
    const params = [`%${name}%`, `%${email}%`, `%${address}%`];
    if (role) { sql += ' AND role=?'; params.push(role); }
    sql += ' ORDER BY ' + order(['name', 'email', 'address', 'role'], sortBy, dir, 'name');
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { next(e); }
};

exports.listStores = async (req, res, next) => {
  try {
    const { name = '', email = '', address = '', sortBy, dir } = req.query;
    const sql = `
      SELECT s.id, s.name, s.email, s.address,
             ROUND(AVG(r.rating),1) AS rating
      FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.name LIKE ? AND s.email LIKE ? AND s.address LIKE ?
      GROUP BY s.id
      ORDER BY ${order(['name', 'email', 'address', 'rating'], sortBy, dir, 'name')}`;
    const [rows] = await db.query(sql, [`%${name}%`, `%${email}%`, `%${address}%`]);
    res.json(rows);
  } catch (e) { next(e); }
};

exports.userDetails = async (req, res, next) => {
  try {
    const [[user]] = await db.query(
      'SELECT id,name,email,address,role FROM users WHERE id=?', [req.params.id]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'OWNER') {
      const [[r]] = await db.query(
        `SELECT ROUND(AVG(r.rating),1) AS rating FROM stores s
         LEFT JOIN ratings r ON r.store_id=s.id WHERE s.owner_id=?`, [user.id]);
      user.rating = r.rating;
    }
    res.json(user);
  } catch (e) { next(e); }
};