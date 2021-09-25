const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EventPostSchema = new Schema({
  maker: {
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
  pictureUrl: {
    type: String,
  },
  cost: {
    type: Number,
    required: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'comment',
    },
  ],
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'customerUser',
      },
    },
  ],
  customersInvolved: [
    {
      type: Schema.Types.ObjectId,
      ref: 'customerUser',
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('eventPost', EventPostSchema);
