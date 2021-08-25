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
    type: String,
    required: true,
  },
  maxUnit: {
    type: Number,
    required: true,
  },
  availableAmount: {
    type: Number,
  },
  inShopCategory: {
    type: String,
    required: true,
  },

  blogLink: [
    {
      post: {
        type: Schema.Types.ObjectId,
        ref: 'blogposts',
      },
      title: {
        type: String,
        required: true,
      },
      link: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('shopItemProfile', ShopitemProfileSchema);
