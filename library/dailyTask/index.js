const dailyTask = () => {
  try {
    require("./fitness")();
    require("./transfer")();
    require("./sackManagers")();

    console.log("*********************** _ TASK HAS COMPLETED _ *********************");
  } catch (err) {
    console.log(`*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`);
  }
};

dailyTask();
