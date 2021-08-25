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
  costPerUnite: {
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
  adminCode: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model('shopItem', ShopItemSchema);
