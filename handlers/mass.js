const { Player, Club, Mass } = require("../models/handler");
const { clubStore, totalClubs } = require("../source/database/clubStore");
const { sortArray } = require("../source/library/commonFunc");
const { catchError, validateRequestBody, sortArr, shuffleArray, validInputs, getRef } = require("../utils/serverFunctions");
const { playerStore, totalPlayers } = require("../source/database/playerStore.js");

exports.fetchMasses = async (req, res, next) => {
  try {
    const response = await Mass.find({});
    const masses = [];

    for (const { ref, created, unmanaged, season } of Object.values(response)) {
      masses.push({ ref, unmanaged, created, season });
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
    const { divisions } = await Mass.findOne({ ref: mass });

    for (let clubRef = 1; clubRef <= totalClubs; clubRef++) {
      const ref = getRef("club", clubRef);
      const {
        budget,
        manager,
        tactics: { squad },
      } = await Club(mass).findOne({ ref });
      clubs.push({ ref, manager, budget, squad });
    }

    return res.status(200).json({ divisions, clubs });
  } catch (err) {
    return catchError({ next, err, message: "unable to locate masses" });
  }
};

exports.fetchHomeData = async (req, res) => {
  try {
    const { mass, club, division } = validateRequestBody(req.body, ["mass", "club", "division"]);

    const clubData = await Club(mass).findOne({ ref: club });
    if (!clubData) throw "Club not found";

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    const { table, goal } = massData[division];

    const calendar = sortArr(
      [
        ...massData[division].calendar
          .filter((x) => x.home === club || x.away === club)
          .map(({ _doc }) => ({ ..._doc, competition: "division" })),
        ...massData.league.calendar
          .filter((x) => x.home === club || x.away === club)
          .map(({ _doc }) => ({ ..._doc, competition: "league" })),
        ...massData.cup.calendar.filter((x) => x.home === club || x.away === club).map(({ _doc }) => ({ ..._doc, competition: "cup" })),
      ],
      "date"
    );

    console.log(calendar[0]);

    const nextMatchIndex = calendar.indexOf(calendar.find((x) => x.hg === null && x.hg === null));

    const myClubCalendar = {
      curMatch: calendar[nextMatchIndex],
      nextMatch: calendar[nextMatchIndex + 1],
      lastFiveMatches: clubData.history.lastFiveMatches,
      prevMatch: nextMatchIndex === 0 ? null : calendar[nextMatchIndex - 1],
    };

    const nextDivisionFixtureIndex = massData[division].calendar.indexOf(
      massData[division].calendar.find((x) => x.hg === null && x.hg === null)
    );
    const nextDivisionFixture = massData[division].calendar.filter(
      (x) => x.date === massData[division].calendar[nextDivisionFixtureIndex].date
    );

    res.status(200).json({
      table: table?.splice(0, 5),
      goal: goal?.splice(0, 3),
      calendar: myClubCalendar,
      nextDivisionFixture,
      transfer: massData.transfer,
      news: massData.news,
    });
  } catch (err) {
    return catchError({ res, err, message: "Issue fetching home calendar" });
  }
};

exports.fetchTournament = async (req, res, next) => {
  try {
    const { mass } = validateRequestBody(req.body, ["mass"]);

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    const tournament = {
      cup: massData.cup,
      league: massData.league,
      divisionOne: massData.divisionOne,
      divisionTwo: massData.divisionTwo,
      divisionFour: massData.divisionFour,
      divisionThree: massData.divisionThree,
    };

    res.status(200).json(tournament);
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.sendOffer = async (req, res, next) => {
  try {
    const { mass, player, club, to, fee } = validateRequestBody(req.body, ["mass", "player", "club", "to", "fee"]);

    // _______________________________ check if Transfer period _____________________________________
    // if (![0, 6, 7].includes(new Date().getMonth()) && player.club !== "club000000") throw "Not yet Transfer period";

    const playerData = await Player(mass).findOne({ ref: player });
    if (!playerData) throw "Player not found";

    const clubData = await Club(mass).findOne({ ref: club });
    if (!clubData) throw "Club not found";

    // _______________________________check if club has enough fund for max player offer_____________________________________
    // if (fee > clubData.budget) throw "Insuffucent Funds";

    // _______________________________check if club will exceed salary cap after signing________________________________

    if (
      [...clubData.tactics.squad, player].reduce((total, cur) => total + (10 / 100) * playerStore(cur).value, 0) > process.env.SALARY_CAP
    )
      throw "Salary Cap will be exceeded after signing";

    //  _____________________________Club already sent offer_____________________________________________
    if (playerData.transfer.offers.includes(club)) throw "Previous Offer not attended to";

    //  _____________________________ Player transfer ban _____________________________________________
    if (playerData.transfer.locked) throw "Player currently suspended from transfer";

    // add to mass offers
    await Mass.updateOne({ ref: mass }, { $addToSet: { offer: { to, fee, from: club, player } } });
    // add to player offers
    await Player(mass).updateOne({ ref: player }, { $addToSet: { "transfer.offers": club } });

    console.log("hey", player);
    //       // if ([7, 8].includes(new Date().getMonth() + 1)) {
    //       const offers = await Clubs.findOne({ club: team }).then((res) => res.offers),
    //         status = offers.some((i) => i.player === player && i.team === club);

    //       switch (!status) {
    //         case true: {
    //           const transactions = { player, team, fee, transferType };
    //           const offers = { player, team: club, fee, transferType };
    //           // add transaction in current club transaction
    //           await Clubs.findOneAndUpdate({ club }, { $addToSet: { transactions } }, { upsert: true });
    //           //add transaction in pending club offers
    //           await Clubs.findOneAndUpdate({ club: team }, { $addToSet: { offers } }, { upsert: true });
    //           res.status(200).send("Bid succesful");
    //           break;
    //         }
    //         default: {
    //           res.status(400).send("Bid Failed");
    //           break;
    //         }
    //       }
    //       // }else
    //       // {
    //       //   res.status(400).send("Wait till July/August for transfers");
    //       // }
    //     } else {
    //       const reports = {
    //         detail: `Transfer offer rejected by ${team}'s President`,
    //         content: `${team} do not value your offer for ${player}, and have no intention selling him, if he's really worth something to you, you know what to do in order to get him.`,
    //       };
    //       await Clubs.findOneAndUpdate({ club }, { $addToSet: { reports } }, { upsert: true });
    //       res.status(400).send("considering bid");
    //     }
    //   } catch (err) {
    //     return next({
    //       status: 400,
    //       message: err,
    //     });
    //   }
    // };
    res.status(200).json("hey");
  } catch (err) {
    if (
      [
        "Insuffucent Funds",
        "Previous Offer not attended to",
        "Player currently suspended from transfer",
        "Salary Cap will be exceeded after signing",
      ].includes(err)
    )
      res.status(400).json(err);

    return catchError({ res, err, message: "unable to send offer" });
  }
};

exports.starter = async (req, res, next) => {
  try {
    const { mass, club, division } = validateRequestBody(req.body, ["mass", "club", "division"]);

    const massData = await Mass.findOne({ ref: mass });
    const clubData = await Club(mass).findOne({ ref: club });
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
//     const result = await Mass.findOne({ soccermass });
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
//     const response = await Mass.findOne({ soccermass });
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
//     const result = await Mass.findOne({ soccermass });
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
//     const result = await Mass.findOne({ soccermass });
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
//     const result = await Mass.findOne({ soccermass });
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
//     const result = await Mass.findOne({ soccermass });
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
