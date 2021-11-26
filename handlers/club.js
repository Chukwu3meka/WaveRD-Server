const { catchError, validateRequestBody, sortArr } = require("../utils/serverFunctions");
const { playerModel, clubModel, Mass } = require("../models/handler");
const { clubStore, totalClubs } = require("../source/database/clubStore");
const { sortArray } = require("../source/library/commonFunc");

exports.fetchHomeCalendar = async (req, res) => {
  try {
    const { mass, club, division } = validateRequestBody(req.body, ["mass", "club", "division"]);

    // get home calendar
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    const leagueCal = massData[division].calendar
      .filter((x) => x.home === club || x.away === club)
      .map(({ _doc }) => ({ ..._doc, competition: "league" }));
    const cup = massData.cup.calendar
      .filter((x) => x.home === club || x.away === club)
      .map(({ _doc }) => ({ ..._doc, competition: "cup" }));
    const league = massData.league.calendar
      .filter((x) => x.home === club || x.away === club)
      .map(({ _doc }) => ({ ..._doc, competition: "champ" }));

    const calendar = sortArr([...leagueCal, ...cup, ...league], "week");
    const nextMatchIndex = calendar.indexOf(calendar.find((x) => x.hg === null && x.hg === null));

    const homeCal = {
      prevMatch: nextMatchIndex === 0 ? null : calendar[nextMatchIndex - 1],
      curMatch: calendar[nextMatchIndex],
      nextMatch: calendar[nextMatchIndex + 1],
    };

    // get lastFiveMatches
    const Clubs = clubModel(mass);
    const clubData = await Clubs.findOne({ ref: club });
    if (!clubData) throw "Club not found";

    res.status(200).json({ ...homeCal, lastFiveMatches: clubData.history.lastFiveMatches });
  } catch (err) {
    return catchError({ res, err, message: "Issue fetching home calendar" });
  }
};

exports.fetchSquad = async (req, res) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const Clubs = clubModel(mass);
    const clubData = await Clubs.findOne({ ref: club });

    if (!clubData) throw "Club not found";

    const {
      tactics: { squad },
    } = clubData;

    res.status(200).json(squad);
  } catch (err) {
    return catchError({ res, err, message: "Unable to fetch squad" });
  }
};

exports.fetchTactics = async (req, res) => {
  try {
    const { mass, club, division } = validateRequestBody(req.body, ["mass", "club", "division"]);

    // const massData = await Mass.findOne({ mass });
    const Clubs = clubModel(mass);
    const Players = playerModel(mass);

    // get club data
    const clubData = await Clubs.findOne({ ref: club });
    if (!clubData) throw "Club not found";

    // get next match
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    const leagueCal = massData[division].calendar
      .filter((x) => x.home === club || x.away === club)
      .map(({ _doc }) => ({ ..._doc, competition: "league" }));
    const cup = massData.cup.calendar
      .filter((x) => x.home === club || x.away === club)
      .map(({ _doc }) => ({ ..._doc, competition: "cup" }));
    const league = massData.league.calendar
      .filter((x) => x.home === club || x.away === club)
      .map(({ _doc }) => ({ ..._doc, competition: "champ" }));

    const calendar = sortArr([...leagueCal, ...cup, ...league], "week");

    const nextMatch = { ...calendar.find((x) => x.hg === null && x.hg === null) };
    nextMatch.opponent = nextMatch.home === club ? nextMatch.away : nextMatch.home;

    const opponentData = await Clubs.findOne({ ref: nextMatch.opponent });
    nextMatch.lastFiveMatches = opponentData.history.lastFiveMatches;

    const playerData = await Players.find({ ref: { $in: clubData.tactics.squad } });
    const clubPlayers = playerData.map((player) => {
      const injuryReturnDate = new Date();
      injuryReturnDate.setDate(injuryReturnDate.getDate() + player.injury.daysLeftToRecovery);

      return {
        player: player.ref,
        energy: player.energy,
        suspended: player.competition[nextMatch.competition].suspended
          ? "Player is serving disciplinary action and should be back soon"
          : false,
        injured: player.injury.daysLeftToRecovery
          ? `Recovering from ${player.injury.injuryType}, expected to resume training on ${injuryReturnDate.toDateString()}`
          : false,
      };
    });

    res.status(200).json({ ...clubData.tactics, clubPlayers, nextMatch });
  } catch (err) {
    return catchError({ res, err, message: "tactics not available" });
  }
};

exports.fetchHistory = async (req, res, next) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const Clubs = clubModel(mass);
    const clubData = await Clubs.findOne({ ref: club });
    if (!clubData) throw "Club not found";

    const history = {};
    history.club = club;
    history.trophies = clubData.history.trophies;
    history.budget = clubData.budget;
    history.manager = clubData.manager;
    history.won = clubData.history.match.won;
    history.tie = clubData.history.match.tie;
    history.lost = clubData.history.match.lost;
    history.goalAgainst = clubData.history.match.goalAgainst;
    history.goalFor = clubData.history.match.goalFor;
    history.events = clubData.history.events;
    history.bestMatch = clubData.history.match.bestMatch;
    history.worstMatch = clubData.history.match.worstMatch;
    history.squad = clubData.tactics.squad;
    history.transfers = [
      {
        desc: "Priciest arrival",
        club: clubData.history.transfer.priciestArrival.club,
        player: clubData.history.transfer.priciestArrival.player,
        fee: clubData.history.transfer.priciestArrival.fee,
        date: new Date(clubData.history.transfer.priciestArrival.date).toDateString(),
      },
      {
        desc: "Cheapest arrival",
        club: clubData.history.transfer.cheapestArrival.club,
        player: clubData.history.transfer.cheapestArrival.player,
        fee: clubData.history.transfer.cheapestArrival.fee,
        date: new Date(clubData.history.transfer.cheapestArrival.date).toDateString(),
      },
      {
        desc: "Priciest departure",
        club: clubData.history.transfer.priciestDeparture.club,
        player: clubData.history.transfer.priciestDeparture.player,
        fee: clubData.history.transfer.priciestDeparture.fee,
        date: new Date(clubData.history.transfer.priciestDeparture.date).toDateString(),
      },
      {
        desc: "Cheapest departure",
        club: clubData.history.transfer.cheapestDeparture.club,
        player: clubData.history.transfer.cheapestDeparture.player,
        fee: clubData.history.transfer.cheapestDeparture.fee,
        date: new Date(clubData.history.transfer.cheapestDeparture.date).toDateString(),
      },
    ];
    history.managers = clubData.history.managers;
    // console.log(clubData.history.events);

    res.status(200).json(history);
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.fetchFinance = async (req, res, next) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const Clubs = clubModel(mass);
    const clubData = await Clubs.findOne({ ref: club });
    if (!clubData) throw "Club not found";
    const {
      review,
      budget,
      nominalAccount,
      tactics: { squad },
    } = clubData;

    res.status(200).json({ budget, nominalAccount, review, club, squad });
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.starter = async (req, res, next) => {
  try {
    const { mass, club, division } = validateRequestBody(req.body, ["mass", "club", "division"]);

    const massData = await Mass.findOne({ ref: mass });
    const Clubs = clubModel(mass);
    const clubData = await Clubs.findOne({ ref: club });
    if (!clubData) throw "Club not found";
    console.log(homeCal, clubData.history.lastFiveMatches);

    res.status(200).json("hey");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

// exports.getReport = async (req, res, next) => {
//   try {
//     const { club, soccermass } = req.body;
//     const Clubs = clubs(soccermass);
//     const result = await Clubs.findOne({ club });
//     res.status(200).send(result.reports);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: "connection failed",
//     });
//   }
// };
// exports.getStat = async (req, res, next) => {
//   try {
//     const { club, soccermass } = req.body;
//     const Clubs = clubs(soccermass);
//     const result = await Clubs.findOne({ club });
//     res.status(200).send(result.stat);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: "connection failed",
//     });
//   }
// };
// exports.getMedical = async (req, res, next) => {
//   try {
//     const { club, soccermass } = req.body;
//     const Clubs = clubs(soccermass);
//     const result = await Clubs.findOne({ club });
//     res.status(200).send(result.medical);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: "connection failed",
//     });
//   }
// };
// exports.getPastMatch = async (req, res, next) => {
//   try {
//     const { club, soccermass, index } = req.body;
//     const Clubs = clubs(soccermass);
//     const result = await Clubs.findOne({ club }).then((res) => res.pastMatch[index]);
//     res.status(200).send(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: "connection failed",
//     });
//   }
// };
// exports.viewMass = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { division } = req.body;
//     const result = await Clubs.find({ division });
//     const viewMass = [];
//     result.forEach((i) => {
//       viewMass.push({
//         id: i._id,
//         club: i.club,
//         manager: i.stat.manager,
//         rating: i.stat.rating,
//       });
//     });
//     res.status(200).send(viewMass);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.syncTarget = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { myClub, name, club } = req.body;
//     const result = await Clubs.findOne({ club: myClub });
//     let target = result.target;
//     if (name.length > 1 && club.length > 1) {
//       const id = `${name}@${club}`;
//       if (target.includes(id)) {
//         target = target.filter((i) => i !== id);
//         await Clubs.findOneAndUpdate({ club: myClub }, { target });
//         const result = await Clubs.findOne({ club: myClub });
//         res.status(200).json(result.target);
//       } else {
//         target.push(id);
//         await Clubs.findOneAndUpdate({ club: myClub }, { target });
//         const result = await Clubs.findOne({ club: myClub });
//         res.status(200).json(result.target);
//       }
//     } else {
//       null;
//     }
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.getTargets = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { club } = req.body;
//     const result = await Clubs.findOne({ club });
//     let targets = result.target;
//     res.status(200).json(targets);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.makeOffer = async (req, res, next) => {
//   try {
//     const { soccermass, club, team, player, fee, transferType } = req.body,
//       Clubs = clubs(soccermass),
//       Athletes = athletes(soccermass),
//       playerValue = await Athletes.findOne({ name: player }).then((res) => res.value),
//       budget = await Clubs.findOne({ club }).then((res) => res.board.budget),
//       minFee = playerValue + 10,
//       maxFee = playerValue + 50;

//     if (budget > fee && fee <= maxFee && fee >= minFee && fee > playerValue) {
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
// exports.getOffers = async (req, res, next) => {
//   try {
//     const { club, soccermass } = req.body,
//       Clubs = clubs(soccermass),
//       offers = await Clubs.findOne({ club }).then((res) => res.offers);
//     res.status(200).send(offers);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.getTransactions = async (req, res, next) => {
//   try {
//     const { club, soccermass } = req.body,
//       Clubs = clubs(soccermass),
//       transactions = await Clubs.findOne({ club }).then((res) => res.transactions);
//     res.status(200).send(transactions);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.withdrawOffer = async (req, res, next) => {
//   try {
//     const { player, team, soccermass, club } = req.body,
//       Clubs = clubs(soccermass);

//     await Clubs.updateOne({ club }, { $pull: { transactions: { player, team } } });
//     await Clubs.updateOne({ club: team }, { $pull: { offers: { player, team: club } } });

//     const result = await Clubs.findOne({ club });
//     const transactions = result.transactions;
//     res.status(200).send(transactions);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.replyOffer = async (req, res, next) => {
//   try {
//     /*
//      club : current team
//      status: accept or reject
//      player : player name
//      team : club intrested in the player
//      transferType: loan or transfer
//      fee: amount offered
//     */
//     if ([7, 8].includes(new Date().getMonth() + 1)) {
//       const { soccermass, club, status, player, team, transferType, fee } = req.body,
//         Clubs = clubs(soccermass),
//         Athletes = athletes(soccermass),
//         playerValue = await Athletes.findOne({ name: player }).then((res) => res.value),
//         budget = await Clubs.findOne({ club: team }).then((res) => res.board.budget),
//         minFee = playerValue + 10,
//         maxFee = playerValue + 50;

//       let noClubPayers = await Clubs.findOne({ club }),
//         noTeamPayers = await Clubs.findOne({ club: team });

//       noClubPayers = noClubPayers.length;
//       noTeamPayers = noTeamPayers.length;

//       if (noTeamPayers < 32 && noClubPayers > 20) {
//         if (budget > fee && fee <= maxFee && fee >= minFee && fee > playerValue) {
//           let clubid = `${soccermass}@${club}`,
//             Players = players(clubid);
//           // remove offer from offers for club
//           await Clubs.updateOne({ club }, { $pull: { offers: { player, team } } }, { multi: true });
//           // remove offer from transaction for team
//           await Clubs.updateOne({ club: team }, { $pull: { transaction: { player, team: club } } }, { multi: true });

//           if (status === "accept") {
//             const teamReport = {
//               detail: "Transfer Accepted",
//               content: `${club} has accepted your $${fee}m ${transferType} offer for ${player}. The player on his way here. Our Technical chief has also arranged for his presentation in coming days`,
//             };
//             const clubReport = {
//               detail: "Player Transfered",
//               content: `${player} has moved to ${team}, you should update the players on our new tactics and formation to cover up for ${player}`,
//             };
//             // add to club reports
//             await Clubs.updateOne({ club: team }, { $addToSet: { reports: teamReport } }, { upsert: true });
//             await Clubs.updateOne({ club }, { $addToSet: { reports: clubReport } }, { upsert: true });

//             // add news to mass
//             const transfers = { name: player, from: club, to: team, fee, transferType };
//             const news = {
//               detail: "Transfer NEWS",
//               content: `${player} has completed his ${transferType} move to ${team}. The Media has been watching this for a while but now they don't have to. ${player} said it's a move that has been on his mind.`,
//             };
//             await Mass.updateOne({ soccermass }, { $addToSet: { transfers, news } }, { upsert: true });

//             // update player new club in athlete collection
//             await Athletes.updateOne({ name: player, club }, { $set: { club: team } });

//             // remove offers from other clubs for player
//             await Clubs.updateOne({ club }, { $pull: { offers: { player } } }, { multi: true });

//             //  save player data record and then delete from Players collection
//             let newPlayer = await Players.findOne({ name: player });
//             await Players.deleteOne({ name: player });

//             clubid = `${soccermass}@${team}`;
//             Players = players(clubid);

//             // assign unique number and slot to newly transfered player
//             const noArray = [],
//               teamNo = await Players.find({});
//             teamNo.forEach((i) => noArray.push(i.number));
//             noArray.sort((x, y) => x - y);
//             let missingNo = [];
//             for (let i = 1; i <= noArray.length; i++) {
//               noArray.indexOf(i) == -1 ? missingNo.push(i) : null;
//             }
//             missingNo = missingNo.sort((x, y) => x - y);
//             missingNo = missingNo[0].toString();
//             newPlayer.number = Number(missingNo);
//             newPlayer.slot.sn = teamNo.length;
//             await Players.create(newPlayer);

//             const offers = await Clubs.find({ club }).then((res) => res.offers);
//             res.status(200).send(offers);
//           } else {
//             const reports = {
//               detail: "Transfer Offer Rejected",
//               content: `${club} has rejected your $${fee}m ${transferType} offer for ${player}`,
//             };
//             await Clubs.findOneAndUpdate({ club: team }, { $addToSet: { reports } }, { upsert: true });
//             await Clubs.updateOne({ club: team }, { "board.budget": budget - fee });
//             await Athletes.updateOne({ club, name: player }, { value: playerValue + 5 });
//             const offers = await Clubs.find({ club }).then((res) => res.offers);

//             res.status(200).send(offers);
//           }
//         }
//       } else {
//         const reports = {
//           detail: "Transfer Offer Rejected",
//           content: `${club} cannot exceed a maximum of 32 players, and ${team} cannot have less than 20 players, as a result of this, your ${fee}m ${transferType} offer for ${player} has rejected.`,
//         };
//         await Clubs.findOneAndUpdate({ club: team }, { $addToSet: { reports } }, { upsert: true });

//         const offers = await Clubs.find({ club }).then((res) => res.offers);

//         res.status(200).send(offers);
//       }
//     } else {
//       res.status(400).send("Wait till July/August for transfers");
//     }
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.viewBoard = async (req, res, next) => {
//   try {
//     const { club } = req.body;
//     const Clubs = detail(req);
//     let result = await Clubs.findOne({ club });
//     res.status(200).send(result.board);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: "Invalid Database Specified",
//     });
//   }
// };
// exports.viewTraining = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { club } = req.body;
//     const result = await Clubs.findOne({ club });
//     res.status(200).send(result.training);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.updateTraining = async (req, res, next) => {
//   const Clubs = detail(req);
//   const { club } = req.body;
//   const trainingKey = Object.keys(req.body)[2];
//   const trainingValue = req.body[trainingKey];
//   try {
//     let date = new Date();
//     date.setDate(date.getDate() + 30);
//     date = date.toDateString();
//     const result = await Clubs.findOne({ club });
//     const training = result.training;
//     training[trainingKey].profile = trainingValue;
//     training[trainingKey].date = date;
//     const result2 = await Clubs.updateOne({ club }, { $set: { training } });
//     res.status(200).json(result2);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.updatePosition = async (req, res, next) => {
//   const Clubs = detail(req);
//   let { club, profile, oldPos, newPos } = req.body;
//   try {
//     let date = new Date();
//     date.setDate(date.getDate() + 300);
//     date = date.toDateString();
//     const result = await Clubs.findOne({ club });
//     const training = result.training;

//     newPos = newPos === null ? oldPos : newPos;
//     training.position = { profile, oldPos, newPos, date };

//     const result2 = await Clubs.updateOne({ club }, { $set: { training } });
//     res.status(200).json(result2);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.viewTactics = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { club } = req.body;
//     const result = await Clubs.findOne({ club });
//     res.status(200).send(result.tactics);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.updateTactics = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { club, tactics } = req.body;
//     const result = await Clubs.updateOne({ club }, { $set: { tactics } });
//     res.send(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.setFormation = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { club, formation } = req.body;
//     await Clubs.updateOne({ club }, { $set: { "stat.formation": formation } });
//     res.status(201).send("success");
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.viewHistory = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { club } = req.body;
//     const result = await Clubs.findOne({ club });
//     res.status(200).send(result.history);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.deleteReport = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { club, _id } = req.body;
//     await Clubs.updateOne({ club }, { $pull: { reports: { _id } } });
//     const result = await Clubs.findOne({ club }).then((res) => res.reports);
//     res.status(200).send(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
