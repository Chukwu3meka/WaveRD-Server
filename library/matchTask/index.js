require("../../models");
const { Mass } = require("../../models/handler");

const matchTask = async () => {
  try {
    const day = new Date().getDay(),
      matchDate = new Date().toDateString(),
      matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

    if ([1, 6, 3].includes(day)) {
      const massData = await Mass.findOne({ ref: "sm000000001" });
      if (!massData) throw "MASS not found";

      const todaysMatch = massData[matchType === "division" ? "divisionOne" : matchType].calendar.filter(
        (fixture) => fixture.date === matchDate
      );

      // prevent match from being played twice
      if (todaysMatch && todaysMatch[0] && todaysMatch[0].hg === null && todaysMatch[0].hg === null) {
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
      } else {
        throw "Match Played Already";
      }
    }

    console.log("*********************** _ TASK HAS COMPLETED _ *********************");
    return "*********************** _ TASK HAS COMPLETED _ *********************";
  } catch (err) {
    console.log(`*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`);
    return `*********************** _ TASK ENDED WITH AN ERROR _ ********************* ${err}`;
  }
};

module.exports = matchTask();
