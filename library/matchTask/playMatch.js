module.exports = async ({ res, datesArray }) => {
  // for (const date of datesArray.filter((_, i) => i <= 10)) {
  for (const date of datesArray) {
    const matchDate = new Date(date).toDateString(),
      day = new Date(date).getDay(),
      matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

    console.log(matchType);

    switch (matchType) {
      case "league":
        // await require("./league")({ matchType, matchDate, res });
        break;
      case "cup":
        await require("./cup")({ matchType, matchDate, res });
        break;
      case "division":
        // await require("./division")({ matchType, matchDate, res });
        break;
      default:
        break;
    }
  }
};

// module.exports = async (res) => {
//   const date = process.env.NODE_ENV === "production" ? new Date() : new Date("Mon Sep 13 2021"),
//     day = date.getDay(),
//     matchDate = date.toDateString(),
//     matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

//   switch (matchType) {
//     // case "league":       return await require("./cup")({ matchType, matchDate, res });
//     case "cup":
//       return await require("./cup")({ matchType, matchDate, res });
//     case "division":
//       return await require("./division")({ matchType, matchDate, res });
//     default:
//       break;
//   }
// };
