require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./src/config/db');
const getAdminEmail = require('./src/config/adminEmail');

(async () => {
  try {
    const email = getAdminEmail();
    const password = process.env.ADMIN_PASSWORD;
    if (!email) throw new Error('Set ADMIN_EMAIL in backend/.env before seeding.');
    if (!password) throw new Error('Set ADMIN_PASSWORD in backend/.env before seeding.');

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (name,email,password_hash,address,role) VALUES (?,?,?,?,'ADMIN')
       ON DUPLICATE KEY UPDATE role='ADMIN'`,
      ['System Administrator Account', email, hash, 'HQ']
    );
    console.info('Administrator account is ready.');
  } catch (error) {
    console.error('Unable to seed administrator:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();