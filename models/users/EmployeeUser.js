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
});

module.exports = mongoose.model('employeeUser', EmployeeUserSchema);
