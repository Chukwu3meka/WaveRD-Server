const mongoose = require("mongoose");

const fixture = {
    date: { type: Date, required: true },
    home: { type: String, required: true },
    hg: { type: Number, required: true },
    ag: { type: Number, required: true },
    away: { type: String, required: true },
  },
  table = [{ club: String, pld: Number, w: Number, d: Number, l: Number, pts: Number, gf: Number, ga: Number, gd: Number }],
  players = [{ player: String, club: String, mp: Number, goal: Number, assist: Number, cs: Number, yellow: Number, red: Number }],
  calendar = [{ week: Number, date: String, home: String, hg: Number, ag: Number, away: String }],
  atomFormat = {
    calendar,
    cs: players,
    goal: players,
    yellow: players,
    red: players,
    assist: players,
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
    knockOut: {
      roundOf32: [fixture],
      roundOf16: [fixture],
      quarterFinalFixture: [fixture],
      semiFinalFixture: [fixture],
      finalFixture: [fixture],
    },
  };

const MassesSchema = new mongoose.Schema({
  season: { type: Number, default: 1 },
  created: { type: Date, default: Date.now },
  ref: { type: String, unique: true, required: true },
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
  cup: atomFormat,
  league: atomFormat,
  divisionOne: { cs: players, goal: players, yellow: players, red: players, assist: players, calendar, table },
  divisionTwo: { cs: players, goal: players, yellow: players, red: players, assist: players, calendar, table },
  divisionFour: { cs: players, goal: players, yellow: players, red: players, assist: players, calendar, table },
  divisionThree: { cs: players, goal: players, yellow: players, red: players, assist: players, calendar, table },
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

module.exports = mongoose.model("mass", MassesSchema, "mass");
