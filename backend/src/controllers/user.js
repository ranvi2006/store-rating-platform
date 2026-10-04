const db = require('../config/db');

exports.listStores = async (req, res, next) => {
  try {
    const { search = '', sortBy, dir } = req.query;
    const col = ['name', 'address', 'overallRating'].includes(sortBy) ? sortBy : 'name';
    const sql = `
      SELECT s.id, s.name, s.address,
             ROUND(AVG(r.rating),1) AS overallRating,
             (SELECT rating FROM ratings WHERE store_id=s.id AND user_id=?) AS myRating
      FROM stores s LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.name LIKE ? OR s.address LIKE ?
      GROUP BY s.id
      ORDER BY ${col} ${dir === 'desc' ? 'DESC' : 'ASC'}`;
    const [rows] = await db.query(sql, [req.user.id, `%${search}%`, `%${search}%`]);
    res.json(rows);
  } catch (e) { next(e); }
};

// One endpoint for both "submit" and "modify"
exports.rate = async (req, res, next) => {
  try {
    const { storeId, rating } = req.body;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be an integer 1-5' });
    const [[store]] = await db.query('SELECT id FROM stores WHERE id=?', [storeId]);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    await db.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [req.user.id, storeId, rating]);
    res.json({ message: 'Rating saved' });
  } catch (e) { next(e); }
};