const { Player } = require("../../../models/handler");
const { massList } = require("../../../source/constants");

module.exports = async () => {
  for (const mass of massList) {
    await Player(mass).updateMany({ energy: { $lt: 90 } }, { $inc: { energy: 10 } });

    // reduce days left to recovery daily
    await Player(mass).updateMany(
      { "injury.daysLeftToRecovery": { $gte: 1 } },
      {
        $inc: { "injury.daysLeftToRecovery": -1 },
      }
    );

    // set injury type to null if days to recovery is 0
    await Player(mass).updateMany(
      { "injury.daysLeftToRecovery": 0, "injury.injuryType": { $ne: null } },
      {
        $set: { "injury.injuryType": null },
      }
    );
  }
};
