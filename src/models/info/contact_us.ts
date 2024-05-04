import { Schema } from "mongoose";

import { infoDatabase } from "../database";

const ContactUsSchema = new Schema({
  contact: { type: String, required: true },
  comment: { type: String, required: true },
  category: { type: String, required: true },
  preference: { type: String, required: true },
  date: { type: String, default: new Date().toDateString() },
});

const DailyStatModel = infoDatabase.model("Contact_Us", ContactUsSchema);

export default DailyStatModel;
