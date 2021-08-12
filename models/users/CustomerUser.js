const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerUserSchema = new Schema({
  phoneNumber: {
    type: Number,
    unique: true,
    required: true,
  },
  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('customerUser', CustomerUserSchema);
