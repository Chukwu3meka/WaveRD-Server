const weeklyTask = async () => {
  try {
    if (new Date().getDay() === 5) {
      await require("./emotion")();
      await require("./formation")();
      await require("./clubReview")();
    }

    console.log("*********************** _ TASK HAS COMPLETED _ *********************");
  } catch (err) {
    console.log(`*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`);
  }
};

weeklyTask();
