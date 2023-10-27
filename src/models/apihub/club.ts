import { Schema } from "mongoose";

import { apihubDatabase } from "../database";

const ClubSchema = new Schema({
  title: { type: String, required: true },
  nickname: { type: String, required: true },
  stadium: { type: String, required: true },
  founded: { type: Number, required: true },
  capacity: { type: Number, required: true },
  location: { type: String, required: true },
  manager: { type: String, required: true },
  rivals: [{ type: String, required: true }],
  squad: [{ type: String, required: true }],
  managers: [
    {
      id: { type: String, required: true },
      fromDate: { type: String, default: new Date().toDateString() },
      toDate: { type: String, default: new Date().toDateString() },
    },
  ],
});

const ClubModel = apihubDatabase.model("Clubs", ClubSchema);

export default ClubModel;
