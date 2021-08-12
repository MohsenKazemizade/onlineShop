const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeProfileSchema = new Schema({
  password: {
    type: String,
    required: true,
  },
  picture: {
    type: Schema.Types.ObjectId,
    ref: 'profilePicture',
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

module.exports = mongoose.model('employeeProfile', EmployeeProfileSchema);
