const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeMessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'adminUser',
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('employeeMessage', EmployeeMessageSchema);
