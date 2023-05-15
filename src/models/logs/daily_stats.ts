import { Schema } from "mongoose";

import { logsDatabase } from "../database";

const DailyStatSchema = new Schema({
  apihub: { type: Number, required: true, default: 0 },
  manager: { type: Number, required: true, default: 0 },
  accounts: { type: Number, required: true, default: 0 },
  date: { type: String, required: true, default: new Date().toDateString() },
});

const DailyStatModel = logsDatabase.model("Daily_Stat", DailyStatSchema);

export default DailyStatModel;
