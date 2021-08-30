const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopItemSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  pictureUrl: {
    type: String,
    required: true,
  },
  costPerUnit: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('shopItem', ShopItemSchema);
