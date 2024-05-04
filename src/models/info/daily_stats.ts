import { Schema } from "mongoose";

import { infoDatabase } from "../database";

const DailyStatSchema = new Schema({
  info: { type: Number, required: true, default: 0 },
  apihub: { type: Number, required: true, default: 0 },
  console: { type: Number, required: true, default: 0 },
  manager: { type: Number, required: true, default: 0 },
  accounts: { type: Number, required: true, default: 0 },
  date: { type: String, required: true, default: new Date().toDateString() },
});

const DailyStatModel = infoDatabase.model("Daily_Stat", DailyStatSchema);

export default DailyStatModel;
