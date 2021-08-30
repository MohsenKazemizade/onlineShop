const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ShopItemProfileSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'shopItem',
  },
  description: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  minUnit: {
    type: Number,
    required: true,
  },
  maxUnit: {
    type: Number,
    required: true,
  },
  availableAmount: {
    type: Number,
    required: true,
  },
  inShopCategory: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  maker: {
    type: Schema.Types.ObjectId,
    ref: 'adminUser',
  },
  blogPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'blogPost',
    },
  ],
});

module.exports = mongoose.model('shopItemProfile', ShopItemProfileSchema);
