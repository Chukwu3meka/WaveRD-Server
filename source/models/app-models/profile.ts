import bcrypt from "bcryptjs";
import { NextFunction } from "express";
import { Schema } from "mongoose";

const ProfileSchema = new Schema({
  // mass: { type: String, required: true },
  // division: { type: String, required: true },
  // club: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: false },
  profile_ID: { type: String, unique: true, required: true },
  // handle: { type: String, required: true },
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
  // v1: { type: {} || null, default: null },
  // award: {
  //   mom: { type: Number, default: 0 },
  //   moy: { type: Number, default: 0 },
  // },
  // clubsManaged: [{ club: { type: String, required: true }, date: { type: Date, default: Date.now } }],
  // gameWarning: {
  //   matchFixing: { type: Number, default: 0 },
  // },
});

ProfileSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;
    return next();
  } catch (err: any) {
    return next(err);
  }
});

ProfileSchema.methods.hashPassword = async function (password: string, next: NextFunction) {
  try {
    return await bcrypt.hash(password, 10);
  } catch (err) {
    next(err);
  }
};

ProfileSchema.methods.comparePassword = async function (attempt: string, next: NextFunction) {
  try {
    return await bcrypt.compare(attempt, this.password);
  } catch (err) {
    next(err);
  }
};

export default ProfileSchema;
