const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogCommentSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
  },
  text: {
    type: String,
    required: true,
  },
  readByAdmin: {
    type: Boolean,
    default: false,
  },
  belongsTo: {
    type: Schema.Types.ObjectId,
    ref: 'blogPost',
  },
  repliedTo: {
    type: Schema.Types.ObjectId,
    ref: 'comment',
  },
  like: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'customerUser',
      },
    },
  ],
  disLike: [
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

module.exports = mongoose.model('blogComment', BlogCommentSchema);
