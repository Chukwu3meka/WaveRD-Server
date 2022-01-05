module.exports = async () => {
  if (new Date().getDay() === 5) {
    await require("./emotion")();
    await require("./formation")();
    await require("./clubReview")();
  }

  return "*********************** _ TASK HAS COMPLETED _ *********************";
};
