const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClubsSchema = new Schema({
  club: { type: String, unique: true, required: true },
  manager: { type: String, default: null },
  budget: { type: Number, default: 200, required: true },
  history: {
    match: {
      won: { type: Number, default: 0 },
      lost: { type: Number, default: 0 },
      draw: { type: Number, default: 0 },
      goalFor: { type: Number, default: 0 },
      goalAgainst: { type: Number, default: 0 },
      bestMatch: {
        opponent: { type: String },
        score: { type: Number, default: 0 },
        date: { type: Date, default: Date.now },
        destination: { type: String, default: "home" },
      },
      worstMatch: {
        opponent: { type: String },
        score: { type: Number, default: 0 },
        date: { type: Date, default: Date.now },
        destination: { type: String, default: "home" },
      },
    },
    transfer: {
      priciestDeparture: {
        club: { type: String },
        fee: { type: Number },
        name: { type: String },
        date: { type: Date, default: Date.now() },
      },
      cheapestDeparture: {
        club: { type: String },
        fee: { type: Number },
        name: { type: String },
        date: { type: Date, default: Date.now() },
      },
      priciestArrival: {
        club: { type: String },
        fee: { type: Number },
        name: { type: String },
        date: { type: Date, default: Date.now() },
      },
      cheapestArrival: {
        club: { type: String },
        fee: { type: Number },
        name: { type: String },
        date: { type: Date, default: Date.now() },
      },
    },
    lastFiveMatches: [{ type: String, default: "win", required: true }],
    manager: [{ manager: String, arrived: { type: Date, default: Date.now } }],
    trophies: {
      league: { type: Number, default: 0, required: true },
      cup: { type: Number, default: 0, required: true },
      champLeag: { type: Number, default: 0, required: true },
    },
    events: [{ date: { type: Date, default: Date.now }, event: String }],
  },
  reports: [
    {
      title: String,
      content: String,
      date: { type: Date, default: Date.now },
      image: { type: String, default: "soccermass.png" },
    },
  ],
  tactics: {
    penalty: String,
    captain: String,
    freekick: String,
    cornerkick: String,
    squad: [{ type: String }],
    pastMatch: { type: Object },
    formation: { type: String, required: true, default: "433A" },
    tackling: { type: String, required: true, default: "Confident" },
    mentality: { type: String, required: true, default: "Balanced" },
    attacking: { type: String, required: true, default: "Middle Axis" },
    tikitaka: { type: String, required: true, default: "Opponent's Half" },
  },
  review: {
    mediaCoverage: { type: Number, default: 2, required: true },
    boardConfidence: { type: String, default: "B", required: true },
    fansSatisfaction: { type: Number, default: 70, required: true },
    presidentsMessage: {
      type: String,
      default:
        "The expectaion of the board is quit high, but we expect you to give your best this season, before any decision can be made concerning your future contract with the club",
      required: true,
    },
  },
  transferOffer: [
    {
      fee: Number,
      club: String,
      player: String,
      date: { type: Date, default: Date.now, required: true },
      offerType: { type: String, default: "arrival, departure", required: true },
    },
  ],
  transferTarget: [{ type: String }],
});

module.exports = ClubsSchema;

/*
    #Tikitaka: opponent's half, all over, own half, no pressing
    #Tackling: confident, hard, auto
    #Mentality: Balanced, offensive, defensive
    #Attacking: Middle Axis, right wing, left wing
    #boardConfidence: A -F
    #mediaCoverage: 1 -5 *** Ambivalent, Estatic, Positive, Impatient, Vehement
    #
    #
    #
*/
