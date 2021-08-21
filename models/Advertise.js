const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdvertiseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  pictureUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  periodOnScrean: {
    type: Number,
    required: true,
  },
  whereToScrean: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  maker: {
    type: Schema,
    Types,
    ObjectId,
    ref: 'adminUser',
  },
  whoIsThisAdFor: {
    type: String,
    required: true,
  },
  costOfAd: {
    type: Number,
  },
});

module.exports = mongoose.model('advertise', AdvertiseSchema);
