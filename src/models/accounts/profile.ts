import bcrypt from "bcryptjs";
import { Schema } from "mongoose";
import { v4 as uuid } from "uuid";

import { accountsDatabase } from "../database";
import { nTimeFromNowFn, range } from "../../utils/handlers";

const ProfileSchema = new Schema(
  {
    fullName: { type: String, required: true },
    created: { type: Date, default: Date.now() },
    handle: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: false },
    role: { type: String, default: "user" }, // ? user || admin
    status: { type: String, default: "active" }, // ? active || suspended

    auth: {
      locked: { type: Date, default: null },
      password: { type: String, required: true },
      sessions: [{ device: { type: String }, session: { type: String }, date: { type: Date, default: Date.now() } }],

      failedAttempts: {
        attempts: { type: Number, default: 0 },
        lastAttenpt: { type: Date, default: null },
      },

      otp: {
        sent: { type: Date, default: Date.now() },
        purpose: { type: String, default: "email verification" },
        code: { type: String, default: `${range(10, 99)}-${uuid()}-${uuid()}` },
        expiry: { type: Date, default: nTimeFromNowFn({ context: "hours", interval: 3 }) },
      },
    },

    stat: {
      cookie: {
        date: { type: Date, default: null },
        consent: { type: Boolean, default: false },
      },
      email: {
        date: { type: Date, default: null },
        verified: { type: Boolean, default: false },
      },
    },
  },
  {
    statics: {
      async comparePassword(attempt: string, password: string) {
        return await bcrypt.compare(attempt, password);
      },
    },
  }
);

ProfileSchema.pre("save", async function (next) {
  try {
    // Hassh password if its a new account
    if (this.auth && this.isModified("auth.password")) this.auth.password = await bcrypt.hash(this.auth.password, 10);
    return next();
  } catch (err: any) {
    return next(err);
  }
});

const ProfileModel = accountsDatabase.model("Profiles", ProfileSchema);

export default ProfileModel;
