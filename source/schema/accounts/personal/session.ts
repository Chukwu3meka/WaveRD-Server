import bcrypt from "bcryptjs";
import { NextFunction } from "express";
import { Schema } from "mongoose";

import { accountsDatabase } from "../../../utils/models";

import { v4 as uniqueId } from "uuid";
import { nTimeFromNowFn } from "../../../utils/handlers";

const SessionSchema = new Schema({
  lastLogin: { type: Date, default: null },
  locked: { type: Boolean, required: true, default: false },
  password: { type: String, required: true },
  status: { type: String, default: "active" },
  failedAttempts: { type: Number, default: 0 },
  email: { type: String, unique: true, required: true },
  role: { type: String, required: true, default: "user" },
  session: { type: String, required: true, unique: true, default: uniqueId() },
  verification: {
    email: { type: Boolean, required: true, default: false },
  },
  otp: {
    purpose: { type: String, default: "email verification" },
    code: { type: String, default: `${uniqueId()}-${uniqueId()}-${uniqueId()}` },
    expiry: { type: Date, default: nTimeFromNowFn({ context: "hours", interval: 3 }) },
  },
});

SessionSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const hashedId = await bcrypt.hash(this._id.toString(), 10);

    // make session longer by replacing special characters
    this.session = `${uniqueId()}-${hashedId}-${uniqueId()}`.replaceAll("/", uniqueId()).replaceAll("$", uniqueId()).replaceAll(".", uniqueId());

    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;

    return next();
  } catch (err: any) {
    return next(err);
  }
});

SessionSchema.methods.hashPassword = async function (password: string, next: NextFunction) {
  try {
    return await bcrypt.hash(password, 10);
  } catch (err) {
    next(err);
  }
};

SessionSchema.methods.comparePassword = async function (attempt: string, next: NextFunction) {
  try {
    return await bcrypt.compare(attempt, this.password);
  } catch (err) {
    next(err);
  }
};

const PersonalSessionModel = accountsDatabase.model("Personal_Profile", SessionSchema, "Personal_Profile");

export default PersonalSessionModel;
