const mongoose = require("mongoose");

const table = [{ club: String, pld: Number, w: Number, d: Number, l: Number, pts: Number, gf: Number, ga: Number, gd: Number }],
  players = [{ name: String, club: String, mp: Number, goal: Number, assist: Number, cs: Number }],
  calendar = [{ week: Number, date: String, home: String, hg: Number, ag: Number, away: String }],
  leagueFormat = { cs: players, goal: players, assist: players, calendar, table },
  cupFormat = { calendar, cs: players, goal: players, assist: players };

const MassesSchema = new mongoose.Schema({
  season: { type: Number, default: 1 },
  created: { type: Date, default: Date.now },
  mass: { type: String, unique: true, required: true },
  unmanaged: {
    divisionOne: { type: Number, required: true, default: 16 },
    divisionTwo: { type: Number, required: true, default: 16 },
    divisionFour: { type: Number, required: true, default: 16 },
    divisionThree: { type: Number, required: true, default: 16 },
    total: { type: Number, required: true, default: 64 },
  },
  divisions: {
    divisionOne: [{ type: String }],
    divisionTwo: [{ type: String }],
    divisionFour: [{ type: String }],
    divisionThree: [{ type: String }],
  },
  cup: {
    ...cupFormat,
    table: {
      groupOne: table,
      groupTwo: table,
      groupThree: table,
      groupFour: table,
      groupFive: table,
      groupSix: table,
      groupSeven: table,
      groupEight: table,
    },
  },
  champLeag: {
    ...cupFormat,
    table: {
      groupOne: table,
      groupTwo: table,
      groupThree: table,
      groupFour: table,
    },
  },
  divisionOne: leagueFormat,
  divisionTwo: leagueFormat,
  divisionFour: leagueFormat,
  divisionThree: leagueFormat,
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
      name: { type: String },
      date: { type: Date, default: Date.now() },
    },
  ],
});

module.exports = mongoose.model("mass", MassesSchema);
