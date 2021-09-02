const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeUserSchema = new Schema({
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('employeeUser', EmployeeUserSchema);
