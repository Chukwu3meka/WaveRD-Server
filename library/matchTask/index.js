require("../../models");

const matchTask = () => {
  try {
    const day = new Date().getDay(),
      matchDate = new Date().toDateString(),
      matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

    switch (matchType) {
      case "cup":
        require("./cup")({ matchType, matchDate });
        break;
      case "league":
        require("./league")({ matchType, matchDate });
        break;
      case "division":
        require("./division")({ matchType, matchDate });
        break;
      default:
        break;
    }

    console.log("*********************** _ TASK HAS COMPLETED _ *********************");
    return "*********************** _ TASK HAS COMPLETED _ *********************";
  } catch (err) {
    console.log(`*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`);
    return `*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`;
  }
};

module.exports = matchTask();
