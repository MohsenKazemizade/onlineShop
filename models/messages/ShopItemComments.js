const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopItemCommentsSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'customerUser',
  },
  qualitySelected: {
    type: String,
  },
  text: {
    type: String,
    required: true,
  },
  itemStar: {
    type: Number,
    required: true,
  },
  recommended: {
    type: Boolean,
    default: true,
  },
  readByAdmin: {
    type: Boolean,
    default: false,
  },
  belongsTo: {
    type: Schema.Types.ObjectId,
    ref: 'shopItem',
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

module.exports = mongoose.model('shopItemComment', ShopItemCommentsSchema);
