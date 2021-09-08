const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountCardSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  maker: {
    type: Schema.Types.ObjectId,
    ref: 'adminUser',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  useCode: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
  },
  discountCodeOwner: {
    type: Schema.Types.ObjectId,
  },
  whoUsed: [
    {
      customerUser: {
        type: Schema.Types.ObjectId,
      },
      timesOfUsed: {
        type: Number,
        default: 0,
      },
    },
  ],
  expiresIn: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  discountType: {
    type: String,
    required: true,
  },
  timesOfUseAvailable: {
    type: Number,
  },
});

module.exports = mongoose.model('discountCard', DiscountCardSchema);
