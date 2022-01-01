const { Player, Club, Mass } = require("../models/handler");
const { clubStore, totalClubs } = require("../source/clubStore");
const { catchError, validateRequestBody, sortArr, shuffleArray, validInputs, getRef } = require("../utils/serverFunctions");
const { playerStore, totalPlayers } = require("../source/playerStore.js");

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
    console.log("req.body", req.body);
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
      transfer: massData.transfer.slice(0, 5),
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
      cup: { ...massData.cup, calendar: sortArr(massData.cup.calendar, "date") },
      league: { ...massData.league, calendar: sortArr(massData.league.calendar, "date") },
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

    // _______________________________ check if Transfer period
    if (![0, 6, 7].includes(new Date().getMonth()) && to !== "club000000") throw "Not yet Transfer period";

    const playerData = await Player(mass).findOne({ ref: player });
    if (!playerData) throw "Player not found";

    const clubData = await Club(mass).findOne({ ref: club });
    if (!clubData) throw "Club not found";

    // _______________________________check if club has enough fund for max player
    if (fee > clubData.budget) throw "Insuffucent Funds";

    // _______________________________check if club will exceed salary cap after
    if (
      [...clubData.tactics.squad, player].reduce((total, cur) => total + (10 / 100) * playerStore(cur).value, 0) > process.env.SALARY_CAP
    )
      throw "Salary Cap will be exceeded after signing";

    //  _____________________________Club already sent
    if (playerData.transfer.offers.includes(club)) throw "Previous Offer not attended to";

    //  _____________________________ Player transfer ban
    if (playerData.transfer.locked) throw "Player currently suspended from transfer";

    // add to mass offers
    await Mass.updateOne(
      { ref: mass },
      {
        $push: {
          offer: {
            $each: [{ to, fee, from: club, player }],
            $position: 0,
          },
        },
      }
    );

    // add to player offers
    await Player(mass).updateOne({ ref: player }, { $addToSet: { "transfer.offers": club } });

    res.status(200).json("success");
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

exports.fetchOffers = async (req, res, next) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Club not found";

    res.status(200).json(massData.offer.filter((offer) => offer.to === club || offer.from === club));
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.callOffOffer = async (req, res) => {
  try {
    const { mass, player, from, to } = validateRequestBody(req.body, ["mass", "player", "from", "to"]);

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    if (!massData.offer.find((x) => x.player === player && x.from === from && x.to === to)) throw "Offer not found";

    await Mass.updateOne({ ref: mass }, { $pull: { offer: { from, player, to } } });

    // remove club from clubsInContact
    await Player(mass).updateOne({ ref: player }, { $pull: { "transfer.offers": from } });

    res.status(200).json("success");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

exports.acceptOffer = async (req, res) => {
  try {
    const { mass, player, from, to } = validateRequestBody(req.body, ["mass", "player", "from", "to"]);

    // _______________________________ check if Transfer period
    if (![0, 6, 7].includes(new Date().getMonth()) && to !== "club000000") throw "Not yet Transfer period";

    // _______________________________ check length of club squad
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    const offerData = massData.offer.find((x) => x.player === player && x.from === from && x.to === to);
    if (!offerData) throw "Offer not found";
    const { to: clubFrom, fee, from: clubTo } = offerData;

    const clubToData = await Club(mass).findOne({ ref: clubTo });
    const clubFromData = await Club(mass).findOne({ ref: clubFrom });

    if (fee > clubToData.budget) throw "Insufficient Funds";

    if (clubToData.tactics.squad.length >= process.env.MAX_SQUAD || clubFromData.tactics.squad.length <= process.env.MIN_SQUAD)
      throw "Squad limit prevents registeration";

    // const clubsInContact = massData.offer.filter((x) => {
    //   x.player === player;
    // });

    // ______________________________________ update mass data
    await Mass.updateOne(
      { ref: mass },
      {
        $push: {
          news: {
            $each: [
              {
                title: `@(club,${from},title) Transfer NEWS`,
                content: `@(club,${from},title) has completed the signing of @(player,${player},name) from @(club,${to},title) for a fee rumored to be in the range of $${fee}m. Our sources tells us that his Medicals will be completed in the next few hours.`,
                image: `/player/${player}.webp`,
              },
            ],
            $slice: 15,
            $position: 0,
          },
          transfer: {
            $each: [
              {
                to: from,
                fee: fee,
                from: to,
                player,
              },
            ],
            $slice: 50,
            $position: 0,
          },
        },
        $pull: { offer: { player } },
      }
    );

    // _______________________________________ update former club data
    const {
      history: {
        transfer: { priciestDeparture, cheapestDeparture },
      },
    } = clubFromData;

    await Club(mass).updateOne(
      { ref: clubFrom },
      {
        $pull: {
          "tactics.squad": player,
          transferTarget: player,
        },
        $inc: { "nominalAccount.departure": fee },
        $set: {
          budget: clubFromData.budget + fee > process.env.MAX_BUDGET ? process.env.MAX_BUDGET : clubFromData.budget + fee,
          "history.transfer.priciestDeparture": {
            club: fee > Number(priciestDeparture.fee) ? clubTo : priciestDeparture.club,
            fee: fee > Number(priciestDeparture.fee) ? fee : priciestDeparture.fee,
            player: fee > Number(priciestDeparture.fee) ? player : priciestDeparture.player,
            date: fee > Number(priciestDeparture.fee) ? new Date() : priciestDeparture.date,
          },
          "history.transfer.cheapestDeparture": {
            club: cheapestDeparture.fee === null || fee < cheapestDeparture.fee ? clubTo : cheapestDeparture.club,
            fee: cheapestDeparture.fee === null || fee < cheapestDeparture.fee ? fee : cheapestDeparture.fee,
            player: cheapestDeparture.fee === null || fee < cheapestDeparture.fee ? player : cheapestDeparture.player,
            date: cheapestDeparture.fee === null || fee < cheapestDeparture.fee ? new Date() : cheapestDeparture.date,
          },
        },
      }
    );

    // ___________________________________________ update to club data
    const {
      history: {
        transfer: { priciestArrival, cheapestArrival },
      },
    } = clubToData;

    await Club(mass).updateOne(
      { ref: clubTo },
      {
        $pull: {
          transferTarget: player,
        },
        $addToSet: {
          "tactics.squad": player,
        },
        $inc: { "nominalAccount.arrival": fee, budget: -fee },
        $set: {
          "history.transfer.priciestArrival": {
            club: fee > Number(priciestArrival.fee) ? clubFrom : priciestArrival.club,
            fee: fee > Number(priciestArrival.fee) ? fee : priciestArrival.fee,
            player: fee > Number(priciestArrival.fee) ? player : priciestArrival.player,
            date: fee > Number(priciestArrival.fee) ? new Date() : priciestArrival.date,
          },
          "history.transfer.cheapestArrival": {
            club: cheapestArrival.fee === null || fee < cheapestArrival.fee ? clubFrom : cheapestArrival.club,
            fee: cheapestArrival.fee === null || fee < cheapestArrival.fee ? fee : cheapestArrival.fee,
            player: cheapestArrival.fee === null || fee < cheapestArrival.fee ? player : cheapestArrival.player,
            date: cheapestArrival.fee === null || fee < cheapestArrival.fee ? new Date() : cheapestArrival.date,
          },
        },
      }
    );

    // _______________________________________ update player data
    await Player(mass).updateOne(
      { ref: player },
      {
        $set: {
          club: clubTo,
          "transfer.listed": false,
          "transfer.locked": true,
        },
        $pull: { "transfer.offers": { from } },
      }
    );

    res.status(200).json("success");
  } catch (err) {
    if (["Squad limit prevents registeration", "Insufficient Funds"].includes(err)) res.status(400).json(err);

    return catchError({ res, err, message: "unable to accept offer" });
  }
};

exports.fetchTransfers = async (req, res, next) => {
  try {
    const { mass, club } = validateRequestBody(req.body, ["mass", "club"]);

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    res.status(200).json(massData.transfer);
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
