const mongoose = require('mongoose');
const schema = mongoose.schema;

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
  useablePeriod: {
    type: Number,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  roundsOfUse: {
    type: Number,
  },
});

module.exports = mongoose.model('discountCard', DiscountCardSchema);
