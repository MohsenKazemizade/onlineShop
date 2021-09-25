const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BlogPostSchema = new Schema({
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
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('blogPost', BlogPostSchema);
