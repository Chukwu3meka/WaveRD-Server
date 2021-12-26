const { Player } = require("../../models/handler");
const { massList } = require("../../source/constants");

module.exports = async () => {
  for (const mass of massList) {
    await Player(mass).updateMany({ session: { $lte: -30 } }, { $set: { emotion: "miserable" } });
    await Player(mass).updateMany({ session: { $lte: -5, $gte: -30 } }, { $set: { emotion: "depressed" } });
    await Player(mass).updateMany({ session: { $lte: 5, $gte: -5 } }, { $set: { emotion: "happy" } });
    await Player(mass).updateMany({ session: { $lte: 30, $gte: 6 } }, { $set: { emotion: "blissful" } });
    await Player(mass).updateMany({ session: { $gte: 30 } }, { $set: { emotion: "ecstatic" } });
  }
};
