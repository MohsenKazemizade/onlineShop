const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ShopItemProfileSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'shopItem',
  },
  description: {
    type: string,
    required: true,
  },
  unit: {
    type: string,
    required: true,
  },
  minUnit: {
    type: string,
    required: true,
  },
  maxUnit: {
    type: number,
    required: true,
  },
  availableAmount: {
    type: number,
  },
  inShopCategory: {
    type: string,
    required: true,
  },
  discount: {
    type: number,
  },
  blogLink: [
    {
      post: {
        type: Schema.Types.ObjectId,
        ref: 'blogposts',
      },
      title: {
        type: string,
        required: true,
      },
      link: {
        type: string,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('shopItemProfile', ShopitemProfileSchema);
