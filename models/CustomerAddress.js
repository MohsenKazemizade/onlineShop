const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CustomerAddressSchema = new Schema({
  addressesText: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  latitude: { type: String },
  longitude: { type: String },
});
module.exports = mongoose.model('customerAddress', CustomerAddressSchema);
