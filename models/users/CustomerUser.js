const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerUserSchema = new Schema({
  phoneNumber: {
    type: Number,
    unique: true,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  emailAddress: {
    type: String,
  },
  customerPoint: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  avatarCode: {
    type: String,
    default: 'defaultUser',
  },
  introducer: {
    type: Schema.Types.ObjectId,
    ref: 'introducerCode',
  },
  customerMessage: [
    {
      message: {
        type: Schema.Types.ObjectId,
        ref: 'customerMessage',
      },
      readed: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = CustomerUser = mongoose.model(
  'customerUser',
  CustomerUserSchema
);
