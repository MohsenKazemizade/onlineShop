const mongoose = required('mangoose');
const Schema = mongoose.Schema;

const CustomerProfileSchema = new Schema({
  password: {
    type: String,
  },
  fullName: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
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
      type: Schema.Types.ObjectId,
      ref: 'customerMessage',
    },
  ],
  eventRegistered: [
    {
      type: Schema.Types.ObjectId,
      ref: 'eventPost',
    },
  ],
});

module.exports = mangoose.model('customerProfile', CustomerProfileSchema);
