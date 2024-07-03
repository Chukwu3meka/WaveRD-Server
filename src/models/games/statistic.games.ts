import { Schema } from "mongoose";
import { gamesDatabase } from "../database";
import { COUNTRIES, DIVISIONS } from "../../utils/constants";

const StatisticSchema = new Schema({
  season: { type: Number, default: 1 },
  created: { type: Date, default: Date.now },
  title: { type: String, unique: true, required: true },

  unmanaged: {
    england_one: { type: Number, required: true, default: 20 },
    england_two: { type: Number, required: true, default: 24 },
    spain_one: { type: Number, required: true, default: 20 },
    spain_two: { type: Number, required: true, default: 22 },
    germany_one: { type: Number, required: true, default: 18 },
    germany_two: { type: Number, required: true, default: 18 },
    italy_one: { type: Number, required: true, default: 20 },
    italy_two: { type: Number, required: true, default: 20 },
    france_one: { type: Number, required: true, default: 18 },
    france_two: { type: Number, required: true, default: 20 },
    brazil_one: { type: Number, required: true, default: 20 },
    brazil_two: { type: Number, required: true, default: 20 },
    portugal_one: { type: Number, required: true, default: 18 },
    portugal_two: { type: Number, required: true, default: 18 },
    netherlands_one: { type: Number, required: true, default: 18 },
    netherlands_two: { type: Number, required: true, default: 20 },
  },

  //   England Premier League: 20
  // England EFL Championship: 24
  // Spain La Liga: 20
  // Spain Segunda División: 22
  // Germany Bundesliga: 18
  // Germany 2. Bundesliga: 18
  // Italy Serie A: 20
  // Italy Serie B: 20
  // France Ligue 1: 18
  // France Ligue 2: 20
  // Brazil Série A: 20
  // Brazil Série B: 20
  // Portugal Primeira Liga: 18
  // Portugal Liga Portugal 2: 18
  // Netherlands Eredivisie: 18
  // Netherlands Eerste Divisie: 20

  award: [
    {
      club: { type: String, required: true },
      name: { type: String, required: true },
      speech: { type: String, required: true },
      division: { type: String, required: true },
      award_desc: { type: String, required: true },
    },
  ],
  news: [
    {
      title: String,
      content: String,
      date: { type: Date, default: Date.now },
      image: { type: String, default: "soccermass.png" },
    },
  ],
  transfer: [
    {
      to: { type: String },
      fee: { type: Number },
      from: { type: String },
      player: { type: String },
      date: { type: Date, default: Date.now() },
    },
  ],
  offer: [
    {
      to: { type: String },
      fee: { type: Number },
      from: { type: String },
      player: { type: String },
      date: { type: Date, default: Date.now() },
    },
  ],
});

const StatisticModel = gamesDatabase.model("Statistic", StatisticSchema);

export default StatisticModel;
