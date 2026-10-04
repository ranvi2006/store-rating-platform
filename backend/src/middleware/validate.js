const { body, validationResult } = require('express-validator');

const rules = {
  name: body('name').trim().isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  email: body('email').trim().isEmail().withMessage('Invalid email'),
  address: body('address').trim().isLength({ max: 400 })
    .withMessage('Address max 400 characters'),
  password: body('password').isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/).withMessage('Need at least one uppercase letter')
    .matches(/[^A-Za-z0-9]/).withMessage('Need at least one special character'),
};

const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }
  next();
};

module.exports = {
  signupRules: [rules.name, rules.email, rules.address, rules.password, handle],
  createUserRules: [rules.name, rules.email, rules.address, rules.password,
    body('role').isIn(['ADMIN', 'USER', 'OWNER']).withMessage('Invalid role'), handle],
  storeRules: [rules.name, rules.email, rules.address,
    body('ownerId').isInt().withMessage('ownerId required'), handle],
  passwordRules: [rules.password, handle],
};