import { Schema } from "mongoose";

import { consoleDatabase } from "../database";

const ContactUsSchema = new Schema({
  date: { type: String, default: new Date().toDateString() },
  category: { type: String, required: true },
  contact: { type: String, required: true },
  comment: { type: String, required: true },
});

const DailyStatModel = consoleDatabase.model("Contact_Us", ContactUsSchema);

export default DailyStatModel;
