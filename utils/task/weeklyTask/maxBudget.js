const { Club } = require("../../models/handler");
const { massList } = require("../../source/constants");

module.exports = async () => {
  for (const mass of massList) {
    await Club(mass).updateMany({ budget: { $gt: process.env.MAX_BUDGET } }, { $set: { budget: process.env.MAX_BUDGET } });
  }
};
