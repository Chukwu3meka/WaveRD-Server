const mongoose = require("mongoose");

const ClubsSchema = require("./clubs");
const PlayersSchema = require("./players");

exports.clubModel = (mass) => {
  mongoose.models = {};
  return mongoose.model(`${mass}clubs`.replace(/ /g, "_").toLowerCase(), ClubsSchema);
};

exports.playerModel = (mass) => {
  mongoose.models = {};
  return mongoose.model(`${mass}players`.replace(/ /g, "_").toLowerCase(), PlayersSchema);
};

exports.athletes = (mass) => {
  // mongoose.models = {};
  // mass = mass.replace(/ /g, "_").toLowerCase();
  // const athlete = `${mass}@athlete`;
  // const Athletes = mongoose.model(athlete, AthletesSchema, athlete);
  // return Athletes;
};

exports.Masses = require("./masses");
exports.Players = require("./players");
exports.Trends = require("./trends");
exports.Profiles = require("./profiles");
