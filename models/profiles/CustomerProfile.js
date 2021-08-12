// const mongoose = required('mangoose');
// const Schema = mongoose.Schema;

// const CustomerProfileSchema = new Schema({
//   fullName: {
//     type: String,
//     required: true,
//   },
//   emailAddress: {
//     type: String,
//   },
//   customerPoint: {
//     type: Number,
//   },
//   date: {
//     type: Date,
//     default: Date.now,
//   },
//   avatarCode: {
//     type: String,
//     default: 'defaultUser',
//   },
//   introducer: {
//     type: Schema.Types.ObjectId,
//     ref: 'introducerCode',
//   },
//   customerMessage: [
//     {
//       message: {
//         type: Schema.Types.ObjectId,
//         ref: 'customerMessage',
//       },
//       readed: {
//         type: Boolean,
//         default: false,
//       },
//     },
//   ],
// });

// module.exports = mangoose.model('customerProfile', CustomerProfileSchema);
