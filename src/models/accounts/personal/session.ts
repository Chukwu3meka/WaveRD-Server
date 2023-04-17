import bcrypt from "bcryptjs";
import { Schema } from "mongoose";
import { v4 as uniqueId } from "uuid";

import { accountsDatabase } from "../../database";
import { nTimeFromNowFn } from "../../../utils/handlers";

const SessionSchema = new Schema(
  {
    lastLogin: { type: Date, default: null },
    locked: { type: Date, default: null },
    password: { type: String, required: true },
    // ? status: { "active",  "suspended" }
    status: { type: String, default: "active" },
    failedAttempts: { type: Number, default: 0 },
    email: { type: String, unique: true, required: true },
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

SessionSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    // const hashedId = await bcrypt.hash(this._id.toString(), 10);

    // make session longer by replacing special characters
    // this.session = `${uniqueId()}-${hashedId}-${uniqueId()}`.replaceAll("/", uniqueId()).replaceAll("$", uniqueId()).replaceAll(".", uniqueId());
    this.session = `${uniqueId()}-${this.id}-${uniqueId()}`;

    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (err: any) {
    return next(err);
  }
});

const PersonalSessionModel = accountsDatabase.model("Personal_Session", SessionSchema);

export default PersonalSessionModel;
