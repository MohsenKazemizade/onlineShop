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
    default: false,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  returned: [
    {
      done: {
        type: Boolean,
      },
      time: {
        type: Date,
        default: Date.now,
      },
      agent: {
        type: Schema.Types.ObjectId,
        ref: 'employeeUser',
      },
      itemReturned: [
        {
          item: {
            type: Schema.Types.ObjectId,
            ref: 'shopItem',
          },
          amount: {
            type: Number,
          },
          describ: {
            type: String,
            required: true,
          },
          itemCost: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  ],
  cancellation: {
    type: Boolean,
    defualt: false,
  },
  whoCanceled: {
    type: Schema.Types.ObjectId,
  },
  cancelDescrib: {
    type: String,
  },
});

module.exports = mongoose.model('cart', CartSchema);
