const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const matchData = {
  mp: { type: Number, default: 0, required: true },
  cs: { type: Number, default: 0, required: true },
  red: { type: Number, default: 0, required: true },
  goal: { type: Number, default: 0, required: true },
  yellow: { type: Number, default: 0, required: true },
  assist: { type: Number, default: 0, required: true },
  // 5 yellow card, one match suspension
  suspended: { type: Number, default: 0, required: true },
};

const PlayersSchema = new Schema({
  club: { type: String, required: true },
  // - 30 per match
  energy: { type: Number, required: true, default: 0 },
  ref: { type: String, unique: true, required: true },
  // played in right position emotion +1, worng position 0 else -1
  session: { type: Number, required: true, default: 0 },
  emotion: { type: String, required: true, default: "Happy" },
  // minutesNotPlayed: { type: Number, required: true, default: 0 },
  // minutesPlayedRight: { type: Number, required: true, default: 0 },
  // minutesPlayedWrong: { type: Number, required: true, default: 0 },
  competition: {
    cup: matchData,
    league: matchData,
    division: matchData,
  },
  history: {
    mp: { type: Number, default: 0, required: true },
    cs: { type: Number, default: 0, required: true },
    red: { type: Number, default: 0, required: true },
    goal: { type: Number, default: 0, required: true },
    yellow: { type: Number, default: 0, required: true },
    assist: { type: Number, default: 0, required: true },
  },
  injury: {
    daysLeftToRecovery: { type: Number, required: true, default: 0 },
    injuryType: { type: String, default: null },
  },
  transfer: {
    offers: [String],
    listed: { type: Boolean, required: true, default: false },
    locked: { type: Boolean, required: true, default: false },
    forcedListed: { type: Boolean, required: true, default: false },
  },
});

module.exports = PlayersSchema;

/*
#Emotion  A-F: miserable, depressed, happy, blissful, ecstatic,
#minutesPlayedRight:  Minutes played in a right role,
#minutesPlayedWrong:  Minutes played in a wrong role,
#Yellow/Red in match data represent matches left to complete suspesion
  red card suspension = 2: means player will miss two matches
  ***suspension format***
  League: 3 then 2, then 1 before it becomes 0
  Cup: 1
#cs: Clean sheet
*/
