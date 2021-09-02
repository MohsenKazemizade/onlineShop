const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  pictureURL: {
    type: String,
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
  employeeMessage: [
    {
      message: {
        type: Schema.Types.ObjectId,
        ref: 'employeeMessage',
      },
      read: {
        type: Boolean,
        defual: false,
      },
    },
  ],
  docLinks: [
    {
      fileTitle: {
        type: String,
      },
      fileURL: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model('employeeProfile', EmployeeProfileSchema);
