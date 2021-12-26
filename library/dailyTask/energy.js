const { Player } = require("../../models/handler");
const { massList } = require("../../source/constants");

module.exports = async () => {
  for (const mass of massList) {
    await Player(mass).updateMany({ energy: { $lt: 95 } }, { $inc: { energy: 5 } });
  }
};
