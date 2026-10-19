const { body } = require('express-validator');

const signupValidation = [
  body('username').isString().withMessage('Username is required').bail().trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may contain letters, numbers and underscores only')
    .toLowerCase(),
  body('email').isString().withMessage('Email is required').bail()
    .isEmail().withMessage('Email must be valid').bail().normalizeEmail(),
  body('password').isString().withMessage('Password is required').bail()
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters')
    .matches(/[A-Z]/).withMessage('Password requires an uppercase letter')
    .matches(/[a-z]/).withMessage('Password requires a lowercase letter')
    .matches(/[0-9]/).withMessage('Password requires a digit')
];

const loginValidation = [
  body('password').isString().withMessage('Password is required').bail().notEmpty().withMessage('Password is required'),
  body('username').optional().isString().withMessage('Username must be a string').bail()
    .trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username has invalid characters').toLowerCase(),
  body('email').optional().isString().withMessage('Email must be a string').bail()
    .isEmail().withMessage('Invalid email').bail().normalizeEmail(),
  body().custom((value) => {
    const hasUsername = typeof value.username === 'string' && value.username.trim().length > 0;
    const hasEmail = typeof value.email === 'string' && value.email.trim().length > 0;
    if (hasUsername === hasEmail) throw new Error('Provide exactly one of username or email');
    return true;
  })
];

module.exports = { signupValidation, loginValidation };
