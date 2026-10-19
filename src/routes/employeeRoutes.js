const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { validate, allowOnly } = require('../middleware/validate');
const { employeeFields, employeeValidation, employeeIdParam, employeeIdQuery } = require('../validators/employeeValidators');
const employee = require('../controllers/employeeController');

router.use(authenticate);
router.route('/employees')
  .get(employee.getEmployees)
  .post(allowOnly(employeeFields), employeeValidation(false), validate, employee.createEmployee)
  .delete(allowOnly(['eid'], 'query'), employeeIdQuery, validate, employee.deleteEmployee);
router.route('/employees/:eid')
  .get(employeeIdParam, validate, employee.getEmployee)
  .put(employeeIdParam, validate, allowOnly(employeeFields), employeeValidation(true), validate, employee.updateEmployee);
module.exports = router;
