const logger = require("heroku-logger");

module.exports = async () => {
  logger.info("message", { key: "direct" });
};

// // module.exports = async ({ res, datesArray }) => {
// //   // for (const date of datesArray.filter((_, i) => i <= 10)) {
// //   for (const date of datesArray) {
// //     const matchDate = new Date(date).toDateString(),
// //       day = new Date(date).getDay(),
// //       matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

// //     switch (matchType) {
// //       case "league":
// //         await require("./league")({ matchType, matchDate, res });
// //         break;
// //       case "cup":
// //         await require("./cup")({ matchType, matchDate, res });
// //         break;
// //       case "division":
// //         await require("./division")({ matchType, matchDate, res });
// //         break;
// //       default:
// //         break;
// //     }
// //   }
// // };

// module.exports = async () => {
//   const day = new Date().getDay(),
//     matchDate = new Date().toDateString(),
//     matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

//   switch (matchType) {
//     case "cup":
//       await require("./cup")({ matchType, matchDate });
//       break;
//     case "league":
//       await require("./league")({ matchType, matchDate });
//       break;
//     case "division":
//       await require("./division")({ matchType, matchDate });
//       break;
//     default:
//       break;
//   }

//   return "*********************** _ TASK HAS COMPLETED _ *********************";
// };
