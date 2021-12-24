const { Club, Mass, Player } = require("../models/handler");
const { clubStore, totalClubs } = require("../source/database/clubStore");
const { sortArray } = require("../source/library/commonFunc");
const { catchError, validateRequestBody, shuffleArray, validInputs, getRef, sortArr } = require("../utils/serverFunctions");

exports.fetchPlayer = async (req, res, next) => {
  try {
    const { club, mass, player } = validateRequestBody(req.body, ["mass", "player", "club"]);

    const clubData = await Club(mass).findOne({ ref: club });
    if (!clubData) throw "Club not found";

    const playerData = await Player(mass).findOne({ ref: player });
    if (!playerData) throw "Player not found";

    res.status(200).json({
      ...playerData._doc,
      budget: clubData.budget,
      transfer: {
        ...playerData.transfer,
        target: clubData.transferTarget.includes(player),
      },
    });
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.randomAgents = async (req, res, next) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const freeAgents = [];
    await Player(mass).aggregate([{ $match: { club: "club000000" } }, { $sample: { size: 3 } }], (err, docs) =>
      !err ? docs.forEach((x) => freeAgents.push(x.ref)) : null
    );

    const transferList = [];
    await Player(mass).aggregate([{ $match: { "transfer.listed": true } }, { $sample: { size: 3 } }], (err, docs) =>
      !err ? docs.forEach((x) => x.club !== club && transferList.push(x.ref)) : null
    );

    res.status(200).json({ transferList, freeAgents, mass, club });
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.searchPlayers = async (req, res, next) => {
  try {
    const { club, mass, name, roles, listed, country, age, value, rating, myClub } = validateRequestBody(req.body, [
      "club",
      "mass",
      "name",
      "roles",
      "listed",
      "country",
      "age",
      "value",
      "rating",
      "myClub",
    ]);

    const { allPlayersInStore } = require("../source/database/playerStore");

    let searchResult = allPlayersInStore().filter(
      (x) =>
        x.age >= age[0] &&
        x.age <= age[1] &&
        x.value >= value[0] &&
        x.value <= value[1] &&
        x.rating >= rating[0] &&
        x.rating <= rating[1]
    );

    if (name !== "search") {
      searchResult = searchResult.filter((x) => x.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (country !== "search") {
      searchResult = searchResult.filter((x) => x.country.toLowerCase().includes(country.toLowerCase()));
    }

    if (roles[0] !== "search") {
      searchResult = searchResult.filter((x) => roles.every((role) => x.roles.includes(role.toUpperCase())));
    }

    searchResult = await Player(mass).find({ ref: { $in: searchResult.map(({ ref }) => ref) } });

    if (club !== "search") {
      searchResult = searchResult.filter((x) => x.club === club);
    }

    if (listed === "listed") searchResult = searchResult.filter((x) => x.transfer.listed === true);
    if (listed === "listed") searchResult = searchResult.filter((x) => x.transfer.listed === false);

    res.status(200).json(searchResult.filter((x) => x.club !== myClub).map(({ ref: player, club }) => ({ player, club })));
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.listPlayer = async (req, res, next) => {
  try {
    const { mass, player, club, list } = validateRequestBody(req.body, ["mass", "player", "club", "list"]);

    await Player(mass).updateOne({ ref: player, club }, { "transfer.listed": list });

    res.status(200).json("success");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.starter = async (req, res, next) => {
  try {
    const { mass, club, division } = validateRequestBody(req.body, ["mass", "club", "division"]);

    const massData = await Mass.findOne({ mass });
    const clubData = await Club(mass).findOne({ club });
    if (!clubData) throw "Club not found";

    console.log(homeCal, clubData.history.lastFiveMatches);

    res.status(200).json("hey");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};
// const { Mass, clubs, athletes, players } = require("../models/handler");

//

// //signup: to view players in any team
// exports.viewPlayers = async (req, res, next) => {
//   try {
//     const { clubid } = req.body;
//     const Players = players(clubid);
//     const result = await Players.find();
//     const viewPlayers = [];
//     result.forEach((x) => {
//       const { name, rating, position, age } = x;
//       viewPlayers.push({ name, rating, position, age });
//     });
//     res.status(200).send(viewPlayers);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// //team/squad: to view my current squad
// exports.viewSquad = async (req, res, next) => {
//   try {
//     const { clubid } = req.body;
//     const Players = players(clubid);
//     const result = await Players.find();
//     const viewPlayers = [];
//     result.forEach((i) => {
//       viewPlayers.push({
//         number: i.number,
//         name: i.name,
//         rating: i.rating,
//         position: i.position,
//         mp: i.data.mp,
//         goal: i.data.goal,
//         assist: i.data.assist,
//         save: i.data.save,
//         age: i.age,
//         report: i.data.emotion,
//       });
//     });
//     viewPlayers.sort((x, y) => x.number - y.number);
//     res.status(200).send(viewPlayers);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// //team/formation: fetch all players
// exports.getPlayers = async (req, res, next) => {
//   try {
//     const { clubid } = req.body;
//     const Players = players(clubid);
//     const result = await Players.find();
//     const viewPlayers = [];
//     result.forEach((i) => {
//       viewPlayers.push({
//         id: i._id,
//         name: i.name,
//         rating: i.rating,
//         position: i.position,
//         slot: i.slot,
//         stat: i.stat,
//       });
//     });
//     res.status(200).send(viewPlayers);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.matchSquad = async (req, res, next) => {
//   try {
//     const { players: squad, clubid } = req.body;
//     const Players = players(clubid);
//     for (const data of squad) {
//       const { id, sn } = data;
//       await Players.updateOne({ _id: id }, { $set: { "slot.sn": sn } });
//     }
//     res.status(200).send("successful");
//   } catch (err) {
//     return next({ status: 400, message: err });
//   }
// };
