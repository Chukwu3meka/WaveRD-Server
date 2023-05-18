import { Schema } from "mongoose";

import { consoleDatabase } from "../database";

const ContactUsSchema = new Schema({
  contact: { type: String, required: true },
  comment: { type: String, required: true },
  category: { type: String, required: true },
  preference: { type: String, required: true },
  date: { type: String, default: new Date().toDateString() },
});

const DailyStatModel = consoleDatabase.model("Contact_Us", ContactUsSchema);

export default DailyStatModel;
