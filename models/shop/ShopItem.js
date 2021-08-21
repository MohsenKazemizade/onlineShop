const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopItems = new Schema({
  title: {
    type: string,
    unique: true,
    required: true,
  },
  pictureUrl: {
    type: string,
    required: true,
  },
  description: {
    type: string,
    required: true,
  },
  costPerUnite: {
    type: number,
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
  pointPerUnitAmount: {
    type: number,
    required: true,
  },
  dateOfCreation: {
    type: Date,
    default: Date.now,
  },
  adminCode: {
    type: number,
    required: true,
  },
});
