const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EventPostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'adminUser',
  },
  date: {
    type: Date,
    default: Dater.now,
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
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'comment',
    },
  ],
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'customerUser',
    },
  ],
  customersInvolved: [
    {
      type: Schema.Types.ObjectId,
      ref: 'customerUser',
    },
  ],
});
module.exports = mongoose.model('eventPost', EventPostSchema);
