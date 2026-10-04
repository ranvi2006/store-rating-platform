const router = require('express').Router();
const c = require('../controllers/admin');
const { authenticate, authorize } = require('../middleware/auth');
const v = require('../middleware/validate');

router.use(authenticate, authorize('ADMIN'));
router.get('/dashboard', c.dashboard);
router.post('/users', v.createUserRules, c.createUser);
router.get('/users', c.listUsers);
router.get('/users/:id', c.userDetails);
router.post('/stores', v.storeRules, c.createStore);
router.get('/stores', c.listStores);
module.exports = router;