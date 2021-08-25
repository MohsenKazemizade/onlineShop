const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DeliverySectionSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  maker: {
    type: Schema.Types.ObjectId,
    ref: 'adminUser',
  },
  sectionStart: {
    type: Date,
    required: true,
  },
  sectionEnd: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('deliverySection', DeliverySectionSchema);
