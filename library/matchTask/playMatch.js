module.exports = async (res) => {
  const date = process.env.NODE_ENV === "production" ? new Date() : new Date("Wed Sep 01 2021"),
    day = date.getDay(),
    matchDate = date.toDateString(),
    matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

  switch (matchType) {
    // case "league":       return await require("./cup")({ matchType, matchDate, res });
    case "cup":
      return await require("./cup")({ matchType, matchDate, res });
    case "division":
      return await require("./division")({ matchType, matchDate, res });
    default:
      break;
  }
};
