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
      message: {
        type: Schema.Types.ObjectId,
        ref: 'employeeComplaint',
      },
      read: {
        type: Boolean,
        defual: false,
      },
    },
  ],
  warnings: [
    {
      message: {
        type: Schema.Types.ObjectId,
        ref: 'employeeWarning',
      },
      read: {
        type: Boolean,
        defual: false,
      },
    },
  ],
});

module.exports = mongoose.model('employeeProfile', EmployeeProfileSchema);
