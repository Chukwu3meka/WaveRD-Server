import { Schema } from "mongoose";

import { apihubDatabase } from "../database";

const PlayerSchema = new Schema({
  ref: { type: String, required: true, unique: true },
  club: { type: String, required: true },
  country: { type: String, required: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  emotion: { type: String, required: true },
  rating: { type: Number, required: true },
  injury: {
    daysLeftToRecovery: { type: Number, required: true, default: 0 },
    injuryType: { type: String, required: true },
  },
  value: { type: Number, required: true },
  roles: [{ type: String }],
});

const PlayerModel = apihubDatabase.model("Players", PlayerSchema);

export default PlayerModel;
