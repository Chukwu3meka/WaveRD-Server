import bcrypt from "bcryptjs";
import { Schema } from "mongoose";
import { v4 as uuid } from "uuid";

import { accountsDatabase } from "../database";
import { generateSession, calcFutureDate, range } from "../../utils/handlers";

const ProfileSchema = new Schema(
  {
    fullName: { type: String, required: true },
    created: { type: Date, default: Date.now() },
    email: { type: String, unique: true, required: false },
    role: { type: String, default: "user" }, // ? user || admin
    status: { type: String, default: "active" }, // ? active || suspended
    cookieConsent: { type: Date, default: null }, // ? Date user wwas notified about cookies
    handle: { type: String, required: true }, // ? Unique but we don't want index created on this

    auth: {
      session: { type: String },
      locked: { type: Date, default: null },
      password: { type: String, required: true },

      failedAttempts: {
        counter: { type: Number, default: 0 },
        lastAttempt: { type: Date, default: null },
      },

      otp: {
        code: { type: String, default: null },
        purpose: { type: String, default: "" },
        time: { type: Date, default: "" },
      },

      verification: {
        email: { type: Date, default: null },
      },
    },
  },
  {
    statics: {
      async comparePassword(attempt: string, password: string) {
        return await bcrypt.compare(attempt, password);
      },
      async hashPassword(password: string) {
        return await bcrypt.hash(password, 10);
      },
    },
  }
);

ProfileSchema.pre("save", async function (next) {
  try {
    if (this.auth && this.auth.otp && this.isModified("auth.password")) {
      this.auth.otp = {
        code: generateSession(this.id),
        purpose: "email verification",
        time: new Date(),
      };
      this.auth.session = generateSession(this.id); // <= generate login session
      this.auth.password = await bcrypt.hash(this.auth.password, 10); // <= Hassh password if its a new account
    }
    return next();
  } catch (err: any) {
    return next(err);
  }
});

const ProfileModel = accountsDatabase.model("Profiles", ProfileSchema);

export default ProfileModel;
