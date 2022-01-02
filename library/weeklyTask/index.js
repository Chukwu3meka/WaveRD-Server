module.exports = async () => {
  await require("./emotion")();
  await require("./formation")();
  await require("./clubReview")();
};
