const mongoose = require("mongoose");

const ClubSchema = require("./club");
const PlayerSchema = require("./player");

exports.Club = (mass) => {
  mongoose.models = {};
  return mongoose.model(`${mass}club`.replace(/ /g, "_").toLowerCase(), ClubSchema, `${mass}club`.replace(/ /g, "_").toLowerCase());
};

exports.Player = (mass) => {
  mongoose.models = {};
  return mongoose.model(
    `${mass}player`.replace(/ /g, "_").toLowerCase(),
    PlayerSchema,
    `${mass}player`.replace(/ /g, "_").toLowerCase()
  );
};

// exports.athletes = (mass) => {
//   // mongoose.models = {};
//   // mass = mass.replace(/ /g, "_").toLowerCase();
//   // const athlete = `${mass}@athlete`;
//   // const Athletes = mongoose.model(athlete, AthletesSchema, athlete);
//   // return Athletes;
// };

exports.Mass = require("./mass");
exports.Profile = require("./profile");
// exports.Player = require("./player");
// exports.Trend = require("./trends");
