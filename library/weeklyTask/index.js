const weeklyTask = () => {
  try {
    if (new Date().getDay() === 5) {
      require("./emotion")();
      require("./formation")();
      require("./maxBudget")();
      require("./clubReview")();
    }

    console.log("*********************** _ TASK HAS COMPLETED _ *********************");
    return "*********************** _ TASK HAS COMPLETED _ *********************";
  } catch (err) {
    console.log(`*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`);
    return `*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`;
  }
};

weeklyTask();
