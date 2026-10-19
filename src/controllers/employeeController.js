const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const { employeeFields } = require('../validators/employeeValidators');

async function accessError(eid, userId) {
  const exists = await Employee.exists({ _id: eid });
  if (exists) {
    logger.warn('Employee authorization denied', { userId, resourceId: eid });
    throw new AppError(403, 'FORBIDDEN', 'You do not own this employee');
  }
  throw new AppError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
}

const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ user: req.user.id }).sort({ created_at: -1 });
  res.status(200).json({ success: true, count: employees.length, data: employees });
});

const createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create({ ...req.body, user: req.user.id });
  logger.info('Employee created', { userId: req.user.id, employeeId: employee._id.toString() });
  res.status(201).json({ success: true, data: employee });
});

const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.eid, user: req.user.id });
  if (!employee) await accessError(req.params.eid, req.user.id);
  res.status(200).json({ success: true, data: employee });
});

const updateEmployee = asyncHandler(async (req, res) => {
  const changes = Object.fromEntries(employeeFields
    .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
    .map((field) => [field, req.body[field]]));
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.eid, user: req.user.id },
    { $set: changes },
    { new: true, runValidators: true }
  );
  if (!employee) await accessError(req.params.eid, req.user.id);
  logger.info('Employee updated', { userId: req.user.id, employeeId: employee._id.toString() });
  res.status(200).json({ success: true, data: employee });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndDelete({ _id: req.query.eid, user: req.user.id });
  if (!employee) await accessError(req.query.eid, req.user.id);
  logger.info('Employee deleted', { userId: req.user.id, employeeId: employee._id.toString() });
  res.status(204).send();
});

module.exports = { getEmployees, createEmployee, getEmployee, updateEmployee, deleteEmployee };
