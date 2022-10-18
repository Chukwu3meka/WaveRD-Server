const { Player } = require("../../models/handler");
const { massList } = require("../../source/constants");

module.exports = async () => {
  for (const mass of massList) {
    await Player(mass).updateMany({ session: { $lte: -30 } }, { $set: { emotion: "Miserable" } });
    await Player(mass).updateMany({ session: { $lte: -10, $gte: -30 } }, { $set: { emotion: "Depressed" } });
    await Player(mass).updateMany({ session: { $lte: 5, $gte: -10 } }, { $set: { emotion: "Happy" } });
    await Player(mass).updateMany({ session: { $lte: 30, $gte: 6 } }, { $set: { emotion: "Blissful" } });
    await Player(mass).updateMany({ session: { $gte: 30 } }, { $set: { emotion: "Ecstatic" } });

    // set injury type to null if days to recovery is 0
    await Player(mass).updateMany(
      { emotion: "Miserable", "transfer.forcedListed": { $ne: true } },
      { $set: { "transfer.forcedListed": true } }
    );
  }
};
