const dailyTask = async () => {
  try {
    await require("./fitness")();
    await require("./transfer")();
    await require("./sackManagers")();

    console.log("*********************** _ TASK HAS COMPLETED _ *********************");
  } catch (err) {
    console.log(`*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`);
  }
};

dailyTask();
