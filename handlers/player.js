const { Club, Mass, Player } = require("../models/handler");
const { clubStore, totalClubs } = require("../source/clubStore");
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
      mySquadLength: clubData.tactics.squad.length,
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

    const { allPlayersInStore } = require("../source/playerStore");

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

exports.releasePlayer = async (req, res, next) => {
  try {
    const { mass, player, club } = validateRequestBody(req.body, ["mass", "player", "club"]);

    // _______________________________ check if Transfer period
    if (![0, 6, 7].includes(new Date().getMonth()) && player.club !== "club000000") throw "Not yet Transfer period";

    // _______________________ reject all offers for the player from mass collection
    await Mass.updateOne(
      { ref: mass },
      {
        $push: {
          news: {
            $each: [
              {
                title: `@(player,${player},name) Contract Termination`,
                content: `@(club,${club},title) has terminated the contract of @(player,${player},age)yrs, @(player,${player},name), the Club has confirmed 'We have reached a mutual agreement with @(player,${player},name) to terminate his contract effective from today.'@(club,${club},title). The @(player,${player},country) internation agent, will be on the hunt to find his client a club soon.`,
                image: `/player/${player}.webp`,
              },
            ],
            $position: 0,
            $slice: 15,
          },
        },
        $pull: { offer: { player } },
      }
    );

    // ___________________________________ update club record
    await Club(mass).updateOne({ ref: club }, { $pull: { "tactics.squad": player } });

    // ___________________________ update player data
    await Player(mass).updateOne(
      { ref: player },
      {
        $set: {
          club: "club000000",
          "transfer.listed": false,
          "transfer.locked": false,
          "transfer.offers": [],
        },
      }
    );

    res.status(200).json("success");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.starter = async (req, res) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Club not found";
    const clubData = await Club(mass).findOne({ ref: club });
    if (!clubData) throw "Club not found";

    console.log(clubData);

    res.status(200).json("success");
  } catch (err) {
    return catchError({ res, err, message: "error occured" });
  }
};
