const router = require('express').Router();
const c = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');
const v = require('../middleware/validate');

router.post('/signup', v.signupRules, c.signup);
router.post('/login', c.login);
router.put('/password', authenticate, v.passwordRules, c.changePassword);
module.exports = router;