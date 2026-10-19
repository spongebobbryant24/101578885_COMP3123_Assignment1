const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  last_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, trim: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  position: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  salary: { type: Number, required: true, min: 0.01 },
  date_of_joining: { type: Date, required: true },
  department: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true, index: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    transform: (_doc, result) => {
      delete result.__v;
      return result;
    }
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
