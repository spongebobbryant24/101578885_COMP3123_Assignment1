const router = require('express').Router();
const { signup, login } = require('../controllers/userController');
const { signupValidation, loginValidation } = require('../validators/userValidators');
const { validate, allowOnly } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimits');

router.post('/signup', authLimiter, allowOnly(['username', 'email', 'password']), signupValidation, validate, signup);
router.post('/login', authLimiter, allowOnly(['username', 'email', 'password']), loginValidation, validate, login);
module.exports = router;
