import { Schema } from "mongoose";
import { gamesDatabase } from "../database";

const CalendarSchema = new Schema({
  week: Number,
  date: String,
  home: String,
  hg: Number,
  ag: Number,
  away: String,
  group: String,
  competition: String,
});

const CalendarModel = gamesDatabase.model("Calendar", CalendarSchema);

export default CalendarModel;
