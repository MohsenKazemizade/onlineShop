const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
  },
  readByAdmin: {
    type: Boolean,
    default: false,
  },
  belongsTo: {
    type: Schema.Types.ObjectId,
  },
  repliedTo: [
    {
      type: Schema.Types.ObjectId,
      ref: 'comment',
    },
  ],
  like: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'customerUser',
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('comment', CommentSchema);
