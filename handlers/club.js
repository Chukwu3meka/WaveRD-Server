const { catchError, validateRequestBody, sortArr, range } = require("../utils/serverFunctions");
const { Player, Club, Mass } = require("../models/handler");
const { clubStore, totalClubs } = require("../source/clubStore");
const { playerStore, totalPlayers } = require("../source/playerStore.js");

exports.fetchSquad = async (req, res) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const clubData = await Club(mass).findOne({ ref: club });
    if (!clubData) throw "Club not found";

    const playerData = await Player(mass).find({ ref: { $in: clubData.tactics.squad } });

    const clubPlayers = playerData.map((player) => ({
      ...player.history,
      ref: player.ref,
      emotion: player.emotion,
      listed: player.transfer.listed,
    }));

    res.status(200).json(clubPlayers);
  } catch (err) {
    return catchError({ res, err, message: "Unable to fetch squad" });
  }
};

exports.fetchTactics = async (req, res) => {
  try {
    const { mass, club, division } = validateRequestBody(req.body, ["mass", "club", "division"]);

    // get club data
    const clubData = await Club(mass).findOne({ ref: club });
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

    const opponentData = await Club(mass).findOne({ ref: nextMatch.opponent });
    nextMatch.lastFiveMatches = opponentData.history.lastFiveMatches;

    const playerData = await Player(mass).find({ ref: { $in: clubData.tactics.squad } });
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

    const players = [...clubData.tactics.squad.map((player) => clubPlayers.find((x) => x.player === player))];
    res.status(200).json({ ...clubData.tactics, players, nextMatch });
  } catch (err) {
    return catchError({ res, err, message: "tactics not available" });
  }
};

exports.fetchHistory = async (req, res) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const clubData = await Club(mass).findOne({ ref: club });
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
    history.lastMatch = clubData.lastMatch;
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

    res.status(200).json(history);
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.fetchFinance = async (req, res) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const clubData = await Club(mass).findOne({ ref: club });
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

exports.saveTactics = async (req, res) => {
  try {
    const { mass, club, formation, mentality, attacking, tackling, tikitaka, squad } = validateRequestBody(req.body, [
      "mass",
      "club",
      "formation",
      "mentality",
      "tackling",
      "tikitaka",
      "attacking",
      "squad",
    ]);

    await Club(mass).updateOne({ ref: club }, { tactics: { squad: [...squad], formation, mentality, attacking, tackling, tikitaka } });

    res.status(200).json(range(1, 10000000));
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.fetchTargets = async (req, res) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const clubData = await Club(mass).findOne({ ref: club });

    res.status(200).json(clubData.transferTarget);
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.targetPlayer = async (req, res) => {
  try {
    const { mass, player, club, target } = validateRequestBody(req.body, ["mass", "player", "club", "target"]);

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    await Club(mass).updateOne({ ref: club }, { [target ? "$addToSet" : "$pull"]: { transferTarget: player } });

    if (
      playerStore(player) &&
      playerStore(player).rating >= 84 &&
      !massData.news.find((x) => x.title === `@(club,${club},title) new transfer target`)
    ) {
      await Mass.updateOne(
        { ref: mass },
        {
          $push: {
            news: {
              $each: [
                {
                  title: `@(club,${club},title) new transfer target`,
                  content: `@(club,${club},title) has decleared interest in signing @(player,${player},name). Only time will tell how commited @(club,${club},nickname) are in signing him. Our source is yet to determine the level of interest. Also confirmed is that there might be some delay in his transfer, for some undisclosed reason.`,
                  image: `/player/${player}.webp`,
                },
              ],
              $slice: 15,
              $position: 0,
            },
          },
        }
      );
    }

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

//               content: `${club} has accepted your $${fee}m ${transferType} offer for ${player}. The player on his way here. Our Technical chief has also arranged for his presentation in coming days`,

//               content: `${player} has moved to ${team}, you should update the players on our new tactics and formation to cover up for ${player}`,

//               content: `${player} has completed his ${transferType} move to ${team}. The Media has been watching this for a while but now they don't have to. ${player} said it's a move that has been on his mind.`,
