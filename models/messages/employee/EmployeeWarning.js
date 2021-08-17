const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeWarningSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'adminUser',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'employeeUser',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('employeeWarning', EmployeeWarningSchema);
