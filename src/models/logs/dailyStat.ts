import { Schema } from "mongoose";
import { logsDatabase } from "../database";

const DailyStatSchema = new Schema({
  date: { type: String, default: new Date().toDateString() },
  subdomains: {
    hub: { type: Number, required: true, default: 0 },
    game: { type: Number, required: true, default: 0 },
    logs: { type: Number, required: true, default: 0 },
    accounts: { type: Number, required: true, default: 0 },
  },
});

const DailyStatModel = logsDatabase.model("Daily_Stat", DailyStatSchema);

export default DailyStatModel;
