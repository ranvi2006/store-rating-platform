const db = require('../config/db');

exports.dashboard = async (req, res, next) => {
  try {
    const [stores] = await db.query(
      `SELECT s.id, s.name, s.address,
              ROUND(AVG(r.rating), 1) AS averageRating,
              COUNT(r.id) AS ratingCount
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id, s.name, s.address
       ORDER BY s.id`,
      [req.user.id]
    );
    if (stores.length === 0) return res.json({ stores: [] });

    const [raters] = await db.query(
      `SELECT s.id AS storeId, u.name, u.email, r.rating, r.updated_at
       FROM stores s
       JOIN ratings r ON r.store_id = s.id
       JOIN users u ON u.id = r.user_id
       WHERE s.owner_id = ?
       ORDER BY r.updated_at DESC`,
      [req.user.id]
    );

    const ratersByStore = new Map();
    for (const rater of raters) {
      if (!ratersByStore.has(rater.storeId)) ratersByStore.set(rater.storeId, []);
      const { storeId, ...details } = rater;
      ratersByStore.get(storeId).push(details);
    }

    res.json({
      stores: stores.map(store => ({
        ...store,
        raters: ratersByStore.get(store.id) || [],
      })),
    });
  } catch (e) { next(e); }
};