import bcrypt from "bcryptjs";
import { Schema } from "mongoose";
import { v4 as uniqueId } from "uuid";

import { accountsDatabase } from "../../database";
import { nTimeFromNowFn } from "../../../utils/handlers";

const ProfileSchema = new Schema(
  {
    fullName: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: false },
    stat: {
      joined: { type: Date, default: Date.now },
      cookieConsent: { type: Boolean, default: false },
      cookieConsentDate: { type: Date },
    },

    lastLogin: { type: Date, default: null },
    locked: { type: Date, default: null },
    password: { type: String, required: true },
    // ? status: { "active",  "suspended" }
    status: { type: String, default: "active" },
    failedAttempts: { type: Number, default: 0 },
    role: { type: String, required: true, default: "user" },
    session: { type: String, required: true, unique: true, default: uniqueId() },
    verification: {
      email: { type: Boolean, required: true, default: false },
    },
    otp: {
      sent: { type: Date, default: new Date() },
      purpose: { type: String, default: "email verification" },
      code: { type: String, default: `${uniqueId()}-${uniqueId()}-${uniqueId()}` },
      expiry: { type: Date, default: nTimeFromNowFn({ context: "hours", interval: 3 }) },
    },
  },
  {
    // methods: {
    //   async comparePassword(attempt: string) {
    //     try {
    //       return await bcrypt.compare(attempt, this.password);
    //     } catch (err) {
    //       throw err;
    //     }
    //   },
    // },

    statics: {
      async comparePassword(attempt: string, password: string) {
        try {
          return await bcrypt.compare(attempt, password);
        } catch (err) {
          throw err;
        }
      },
    },
  }
);

ProfileSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    // const hashedId = await bcrypt.hash(this._id.toString(), 10);

    this.session = `${uniqueId()}-${this.id}-${uniqueId()}`; // <=  make session longer by replacing special characters

    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (err: any) {
    return next(err);
  }
});

const PersonalProfileModel = accountsDatabase.model("Personal_Profiles", ProfileSchema);

export default PersonalProfileModel;
