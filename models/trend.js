const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TrendSchema = new Schema({
  soccermass: { type: String, required: true },
  division: { type: String, required: true },
  club: { type: String, required: true },
  handle: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trend", TrendSchema);
