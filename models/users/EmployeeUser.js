const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeUserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  picture: {
    type: Schema.Types.ObjectId,
    ref: 'profilePicture',
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'role',
  },
  complaints: [
    {
      type: Schema.Types.ObjectId,
      ref: 'employeeComplaints',
    },
  ],
  warnings: [
    {
      type: Schema.Types.ObjectId,
      ref: 'employeeWarning',
    },
  ],
});

module.exports = EmployeeUser = mongoose.model(
  'employeeUser',
  EmployeeUserSchema
);
