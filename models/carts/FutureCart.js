const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FutureCartSchema = new Schema({
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
});

module.exports = mongoose.model('cart', FutureCartSchema);
