const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopItemSchema = new Schema({
  title: {
    type: string,
    unique: true,
    required: true,
  },
  pictureUrl: {
    type: string,
    required: true,
  },
  costPerUnite: {
    type: number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  adminCode: {
    type: number,
    required: true,
  },
});
module.exports = mongoose.model('shopItem', ShopItemSchema);
