const dailyTask = async () => {
  await require("./fitness")();
  await require("./transfer")();
  await require("./sackManagers")();

  console.log("*********************** _ TASK HAS COMPLETED _ *********************");
};

dailyTask();
