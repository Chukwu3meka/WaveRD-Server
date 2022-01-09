const weeklyTask = async () => {
  if (new Date().getDay() === 5) {
    await require("./emotion")();
    await require("./formation")();
    await require("./clubReview")();
  }

  console.log("*********************** _ TASK HAS COMPLETED _ *********************");
};

weeklyTask();
