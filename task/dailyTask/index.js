const dailyTask = () => {
  try {
    require("./fitness")();
    require("./replyPremium")();
    require("./sackManagers")();
    require("./replyUnmanaged")();

    console.log("*********************** _ TASK HAS COMPLETED _ *********************");
    return "*********************** _ TASK HAS COMPLETED _ *********************";
  } catch (err) {
    console.log(`*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`);
    return `*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`;
  }
};

module.exports = dailyTask;
