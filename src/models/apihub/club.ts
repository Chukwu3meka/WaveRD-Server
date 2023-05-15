import { Schema } from "mongoose";

import { apihubDatabase } from "../database";

const ClubSchema = new Schema({
  coach: { type: String, required: true },
  title: { type: String, required: true },
  founded: { type: Number, required: true },
  stadium: { type: String, required: true },
  nickname: { type: String, required: true },
  capacity: { type: Number, required: true },
  location: { type: String, required: true },
  rivals: [{ type: String, required: true }],
});

const ClubModel = apihubDatabase.model("Clubs", ClubSchema);

export default ClubModel;
