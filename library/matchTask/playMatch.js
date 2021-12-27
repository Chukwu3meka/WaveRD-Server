module.exports = async (res) => {
  // const date = process.env.NODE_ENV === "production" ? new Date() : new Date("Sat Aug 14 2021"),
  const date = process.env.NODE_ENV === "production" ? new Date() : new Date("Mon Aug 16 2021"),
    day = date.getDay(),
    matchDate = date.toDateString(),
    matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

  switch (matchType) {
    case "league": {
      await require("./league")({ matchType, matchDate, res });
      break;
    }
    case "cup": {
      await require("./cup")({ matchType, matchDate, res });
      break;
    }
    case "division": {
      await require("./division")({ matchType, matchDate, res });
      // await require("./divisionOne")({ matchType, matchDate });
      // await require("./divisionOne")({ matchType, matchDate });
      // await require("./divisionOne")({ matchType, matchDate });
      break;
    }
    default:
      break;
  }
};
