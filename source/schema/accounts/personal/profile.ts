import { Schema } from "mongoose";
import { accountsDatabase } from "../../../utils/models";

const ProfileSchema = new Schema({
  handle: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: false },
  stat: {
    joined: { type: Date, default: Date.now },
  },
});

const PersonalProfileModel = accountsDatabase.model("Personal_Profile", ProfileSchema, "Personal_Profile");

export default PersonalProfileModel;
