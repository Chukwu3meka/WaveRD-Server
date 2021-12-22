const { players } = require("../../models/handler");
const { massList, clubs } = require("../../source/library/constants");

module.exports = async () => {
  for (const mass of massList) {
    for (const club of clubs) {
      const clubid = `${mass}@${club}`.replace(/ /g, "_").toLowerCase();
      const Players = players(clubid);
      await Players.updateMany(
        { "slot.energy": { $lt: 95 } },
        {
          $inc: {
            "slot.energy": 5,
          },
        }
      );
    }
  }
};
