module.exports = async () => {
  await require("./energy")();
  await require("./injury")();
};
