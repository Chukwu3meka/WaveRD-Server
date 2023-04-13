import { Schema } from "mongoose";
import { accountsDatabase } from "../../database";

const ProfileSchema = new Schema({
  fullName: { type: String, required: true },
  handle: { type: String, required: true, unique: true },
  email: { type: String, unique: true, required: false },
  stat: {
    joined: { type: Date, default: Date.now },
    cookieConsent: { type: Boolean, default: false },
    cookieConsentDate: { type: Date, default: Date.now },
  },
});

const PersonalProfileModel = accountsDatabase.model("Personal_Profiles", ProfileSchema);

export default PersonalProfileModel;
