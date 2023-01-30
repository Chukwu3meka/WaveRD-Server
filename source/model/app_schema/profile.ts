import { appDB } from "..";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  // mass: { type: String, required: true },
  // division: { type: String, required: true },
  // club: { type: String, required: true },
  email: { type: String, unique: true, required: false },
  password: { type: String, required: true },
  handle: { type: String, required: true },
  // session: { type: String, required: true, unique: true },
  // stat: {
  //   registered: { type: Date, default: Date.now },
  //   verified: { type: String, default: false },
  //   otp: {
  //     exp: { type: Date, default: null },
  //     code: { type: Number, default: null },
  //     data: { type: String, default: null },
  //     status: { type: String, default: null },
  //   },
  // },
  // award: {
  //   mom: { type: Number, default: 0 },
  //   moy: { type: Number, default: 0 },
  // },
  // clubsManaged: [{ club: { type: String, required: true }, date: { type: Date, default: Date.now } }],
  // gameWarning: {
  //   matchFixing: { type: Number, default: 0 },
  // },
});

// ProfileSchema.pre("save", async function (next) {
//   try {
//     if (!this.isModified("password")) {
//       return next();
//     }
//     const hashed = await bcrypt.hash(this.password, 10);
//     this.password = hashed;
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });

// ProfileSchema.methods.hashPassword = async function (password, next) {
//   try {
//     return await bcrypt.hash(password, 10);
//   } catch (err) {
//     next(err);
//   }
// };
// ProfileSchema.methods.comparePassword = async function (attempt, next) {
//   try {
//     return await bcrypt.compare(attempt, this.password);
//   } catch (err) {
//     next(err);
//   }
// };

module.exports = appDB.model("profile", ProfileSchema);
