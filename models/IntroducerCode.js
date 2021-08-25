const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const IntroducerCodeSchema = new Schema({
  introducer: {
    type: Schema.Types.ObjectId,
    ref: 'customerUser',
  },
  code: {
    type: String,
    unique: true,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  freinds: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'customerUser',
      },
      date: {
        type: Date,
      },
    },
  ],
});

module.exports = mongoose.model('introducerCode', IntroducerCodeSchema);
