module.exports = async () => {
  await require("./fitness")();
  await require("./transfer")();
  await require("./sackManagers")();
};
