const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EventCartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'customeruser',
  },
  event: {
    typeL: Schema.Types.ObjectId,
    ref: 'eventPost',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  payed: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model('eventCart', EventCartSchema);
