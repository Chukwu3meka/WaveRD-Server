const { clubModel, Masses } = require("../models/handler");
const { clubStore, totalClubs } = require("../source/database/clubStore");
const { sortArray } = require("../source/library/commonFunc");
const { catchError, validateRequestBody, shuffleArray, validInputs, getRef } = require("../utils/serverFunctions");

exports.fetchMasses = async (req, res, next) => {
  try {
    const masses = [];
    const response = await Masses.find({});
    for (const { mass, created, unmanaged, season } of Object.values(response)) {
      masses.push({ mass, unmanaged, created, season });
    }
    return res.status(200).json(masses);
  } catch (err) {
    return catchError({ next, err, message: "unable to locate masses" });
  }
};

exports.fetchMassData = async (req, res, next) => {
  try {
    const { mass } = validateRequestBody(req.body, ["mass"]);

    const clubs = [];
    const Clubs = clubModel(mass);
    const { divisions } = await Masses.findOne({ mass });

    for (let clubRef = 1; clubRef <= totalClubs; clubRef++) {
      const club = getRef("club", clubRef);
      const {
        budget,
        manager,
        tactics: { squad },
      } = await Clubs.findOne({ club });

      const clubData = { club, manager, budget, squad };
      clubs.push(clubData);
    }

    return res.status(200).json({ divisions, clubs });
  } catch (err) {
    return catchError({ next, err, message: "unable to locate masses" });
  }
};

exports.fetchHomeTables = async (req, res, next) => {
  try {
    const { mass, division } = validateRequestBody(req.body, ["mass", "division"]);

    const massData = await Masses.findOne({ mass });
    if (!massData) throw "Mass not found";

    const { table, goal } = massData[division];

    res.status(200).json({ table: table?.splice(0, 7), goal });
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};
exports.starter = async (req, res, next) => {
  try {
    const { mass, club, division } = validateRequestBody(req.body, ["mass", "club", "division"]);

    const massData = await Masses.findOne({ mass });
    const Clubs = clubModel(mass);
    const clubData = await Clubs.findOne({ club });
    if (!clubData) throw "Club not found";
    console.log(homeCal, clubData.history.lastFiveMatches);

    res.status(200).json("hey");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

// // sm0000000001
// exports.getCurrentMatches = async (req, res, next) => {
//   try {
//     const { club, soccermass, division } = req.body;
//     const Clubs = clubs(soccermass);
//     const involvements = await Clubs.findOne({ club }).then((res) => res.involvement);
//     const result = await Masses.findOne({ soccermass });
//     //each division has its own object
//     const allCalendars = [];
//     involvements.forEach((x) => {
//       if (["ChampionsLeague", "EuropaLeague"].includes(x)) {
//         const cal = result[x]["calendar"];
//         if (cal) allCalendars.push({ [x]: cal });
//       } else {
//         const cal = result[`${division}_${x}`]["calendar"];
//         if (cal) allCalendars.push({ [x]: cal });
//       }
//     });
//     //all division joined together and added together
//     let calendar = [];
//     allCalendars.forEach((x) => {
//       for (const y in x) {
//         x[y].forEach((z) => {
//           const { date, home, hg, ag, away } = z;
//           calendar.push({ date, home, hg, ag, away, division: y });
//         });
//       }
//     });

//     calendar = calendar
//       .filter((i) => i.away === club || i.home === club)
//       .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());

//     //to separate old and new matches into diff array
//     const oldMatches = calendar.filter((i) => i.hg !== null),
//       newMatches = calendar.filter((i) => i.hg === null);

//     // res.send(calendar);
//     calendar = [];
//     const mapMatches = () => {
//       if (oldMatches.length === 0) {
//         calendar.push("unavailable");
//         calendar.push("unavailable");
//       } else if (oldMatches.length === 1) {
//         calendar.push("unavailable");
//         calendar.push(oldMatches[oldMatches.length - 1]);
//       } else {
//         calendar.push(oldMatches[oldMatches.length - 2]);
//         calendar.push(oldMatches[oldMatches.length - 1]);
//       }
//       if (newMatches.length === 0) {
//         calendar.push("unavailable");
//         calendar.push("unavailable");
//         calendar.push("unavailable");
//       } else if (newMatches.length === 1) {
//         calendar.push(newMatches[0]);
//         calendar.push("unavailable");
//         calendar.push("unavailable");
//       } else if (newMatches.length === 2) {
//         calendar.push(newMatches[0]);
//         calendar.push(newMatches[1]);
//         calendar.push([]);
//       } else {
//         calendar.push(newMatches[0]);
//         calendar.push(newMatches[1]);
//         calendar.push(newMatches[2]);
//       }
//     };
//     mapMatches();

//     res.status(200).send(calendar);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.getHomeTables = async (req, res, next) => {
//   try {
//     const { soccermass, division } = req.body;
//     const response = await Masses.findOne({ soccermass });
//     const result = {};
//     result.table = sortArray(response[`${division}_League`]["table"], "table");
//     result.goal = response[`${division}_League`]["goal"];
//     const tableObject = { table: result.table, goalAssist: result.goal };
//     res.status(200).send(tableObject);
//   } catch (err) {
//     res.status(400).send("failed");
//   }
// };
// exports.getnews = async (req, res, next) => {
//   try {
//     const { soccermass } = req.body;
//     const result = await Masses.findOne({ soccermass });
//     res.status(200).send(result.news);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };

// exports.leagueData = async (req, res, next) => {
//   try {
//     const { soccermass, division } = req.body;
//     const div = division.toLowerCase().replace(/ /g, "");
//     const result = await Masses.findOne({ soccermass });
//     res.status(200).send(result[div]);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.getRecords = async (req, res, next) => {
//   try {
//     const { soccermass, division, key = "calendar", domain = "League" } = req.body;
//     // key::::: goalAssist, calendar, table
//     // domain:::::::League, Supercup cup
//     const result = await Masses.findOne({ soccermass });
//     const calendar = result[`${division}_${domain}`][key];
//     // return res.status(200).send({ dfd: calendar.length });
//     return res.status(200).send(calendar);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.competition = async (req, res, next) => {
//   try {
//     const { soccermass, category } = req.body;
//     const result = await Masses.findOne({ soccermass });
//     return res.status(200).send(result[category]);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.transfers = async (req, res, next) => {
//   try {
//     const { soccermass } = req.body;
//     const result = await Masses.findOne({ soccermass });
//     return res.status(200).send(result.transfers);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// //in registration to know how many teams are available
// exports.getAvailableTeam = async (req, res, next) => {
//   try {
//     const { type = "soccermass", soccermass } = req.body;

//     switch (type) {
//       case "soccermass": {
//         const result = await Masses.find({});
//         const masses = [];
//         for (const record in result) {
//           const { soccermass, clubs } = result[record];
//           masses.push([soccermass, clubs]);
//         }
//         return res.status(200).send(masses);
//       }
//       case "division": {
//         const result = await Masses.findOne({ soccermass });
//         if (result) {
//           const divisions = result.divisions;
//           return res.status(202).send(divisions);
//         } else {
//           return res.status(400).send("invalid mass specified");
//         }
//       }
//       default: {
//         return res.status(404).send("request is not invalid");
//       }
//     }
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.getAwards = async (req, res, next) => {
//   try {
//     const { soccermass } = req.body;
//     const awards = await Masses.findOne({ soccermass }).then((res) => res.awards);
//     res.status(200).send(awards);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
