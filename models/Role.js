const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeRoleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  accesses: [
    {
      accessCode: {
        type: Schema.Types.ObjectId,
      },
    },
  ],
});

module.exports = mongoose.model('role', EmployeeRoleSchema);
