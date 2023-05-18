import { Schema } from "mongoose";

import { consoleDatabase } from "../database";

const ContactUsSchema = new Schema({
  date: { type: String, default: new Date().toDateString() },
  category: { type: String, required: true },
  email: { type: String },
  comment: { type: String, required: true },
  mobile: { type: String },
});

const DailyStatModel = consoleDatabase.model("Contact_Us", ContactUsSchema);

export default DailyStatModel;
