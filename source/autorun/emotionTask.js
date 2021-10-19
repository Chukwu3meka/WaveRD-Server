const { players } = require("../../models/handler");
const { massList, clubs } = require("../../source/library/constants");

module.exports = async () => {
  for (const mass of massList) {
    for (const club of clubs) {
      const clubid = `${mass}@${club}`.replace(/ /g, "_").toLowerCase();
      const Players = players(clubid);

      await Players.updateMany({ "data.session": { $lte: -30 } }, { $set: { "data.emotion": "miserable" } });
      await Players.updateMany({ "data.session": { $lte: -5, $gte: -30 } }, { $set: { "data.emotion": "depressed" } });
      await Players.updateMany({ "data.session": { $lte: 5, $gte: -5 } }, { $set: { "data.emotion": "happy" } });
      await Players.updateMany({ "data.session": { $lte: 30, $gte: 6 } }, { $set: { "data.emotion": "blissful" } });
      await Players.updateMany({ "data.session": { $gte: 30 } }, { $set: { "data.emotion": "ecstatic" } });
    }
  }
};
