const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'customerUser',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  items: [
    {
      cartItem: {
        type: Schema.Types.ObjectId,
        ref: 'shopItem',
      },
      amountInCart: {
        type: Number,
        required: true,
      },
    },
  ],
  customerAddress: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  deliverySectionSelected: [
    {
      deliverySection: {
        type: Schema.Types.ObjectId,
        ref: 'deliverySection',
      },
      deliveryDate: {
        type: Date,
      },
    },
  ],
  payed: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model('cart', CartSchema);
