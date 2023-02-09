import { Schema } from "mongoose";

import { accountsDatabase } from "../database";

const SessionSchema = new Schema(
  {
    title: { type: String, required: true },
    nickname: { type: String, required: true },
    founded: { type: Number, required: true },
    stadium: { type: String, required: true },
    capacity: { type: Number, required: true },
    location: { type: String, required: true },
    coach: { type: String, required: true },
    rivals: [{ type: String, required: true }],
  }
  // {
  //   statics: {
  //     async comparePassword(attempt: string, password: string) {
  //       try {
  //         return await bcrypt.compare(attempt, password);
  //       } catch (err) {
  //         throw err;
  //       }
  //     },
  //   },
  // }
);

// SessionSchema.pre("save", async function (next) {
//   try {
//     if (!this.isModified("password")) return next();

//     const hashedId = await bcrypt.hash(this._id.toString(), 10);

//     // make session longer by replacing special characters
//     // this.session = `${uniqueId()}-${hashedId}-${uniqueId()}`.replaceAll("/", uniqueId()).replaceAll("$", uniqueId()).replaceAll(".", uniqueId());

//     const hashedPassword = await bcrypt.hash(this.password, 10);
//     this.password = hashedPassword;
//     return next();
//   } catch (err: any) {
//     return next(err);
//   }
// });

const PersonalSessionModel = accountsDatabase.model("Personal_Session", SessionSchema);

export default PersonalSessionModel;
