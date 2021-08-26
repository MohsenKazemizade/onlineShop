const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeProfileSchema = new Schema({
  password: {
    type: String,
    required: true,
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
      type: Schema.Types.ObjectId,
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
