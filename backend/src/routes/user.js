const router = require('express').Router();
const c = require('../controllers/user');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('USER'));
router.get('/', c.listStores);        // GET /api/stores
router.post('/rate', c.rate);         // POST /api/stores/rate  { storeId, rating }
module.exports = router;