const mongoose = require('mongoose');
const schema = mongoose.Schema;

const AccessCodeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('accessCode', AccessCodeSchema);
