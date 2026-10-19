const { body, param, query } = require('express-validator');

const employeeFields = [ 'first_name', 'last_name', 'email', 'position', 'salary', 'date_of_joining', 'department' ];

function employeeValidation(partial = false) {
  const optional = (chain) => partial ? chain.optional() : chain.exists({ values: 'falsy' }).withMessage('Field is required').bail();
  const word = (key, min, max) => optional(body(key))
    .isString().withMessage(`${key} must be a string`).bail().trim()
    .isLength({ min, max }).withMessage(`${key} must be ${min}-${max} characters`);
  return [
    word('first_name', 2, 60),
    word('last_name', 2, 60),
    optional(body('email')).isString().withMessage('email must be a string').bail()
      .isEmail().withMessage('Invalid employee email').bail().normalizeEmail(),
    word('position', 2, 100),
    optional(body('salary')).isFloat({ gt: 0 }).withMessage('salary must be a positive number').bail().toFloat(),
    optional(body('date_of_joining')).isISO8601({ strict: true, strictSeparator: true }).withMessage('Invalid ISO 8601 date').bail().toDate(),
    word('department', 2, 100),
    ...(partial ? [body().custom((value) => {
      if (!employeeFields.some((name) => Object.prototype.hasOwnProperty.call(value, name))) {
        throw new Error('At least one employee field is required');
      }
      return true;
    })] : [])
  ];
}

const employeeIdParam = [ param('eid').isMongoId().withMessage('Invalid employee ID') ];
const employeeIdQuery = [ query('eid').isMongoId().withMessage('Invalid employee ID') ];
module.exports = { employeeFields, employeeValidation, employeeIdParam, employeeIdQuery };
