const { Club, Player, Mass } = require("../../models/handler");
const { clubStore, totalClubs } = require("../../source/clubStore.js");
const { playerStore, totalPlayers } = require("../../source/playerStore.js");
const { massList, roleList, formationList } = require("../../source/constants");

module.exports = async ({ matchDate, matchType }) => {
  for (const mass of massList) {
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Club not found";

    for (const divNum of ["divisionOne", "divisionTwo", "divisionThree", "divisionFour"]) {
      // const todaysMatch = massData[divNum].calendar.filter(({ date, home, away }) => date === matchDate && { date, home, away });
      const todaysMatch = [
        {
          date: "Mon Aug 16 2021",
          home: "club000017",
          away: "club000053",
        },
      ];

      for (const { home, away } of todaysMatch) {
        const matchData = {
          homeClubData: {},
          awayClubData: {},
        };

        for (const ref of [home, away]) {
          const clubData = await Club(mass).findOne({ ref: ref });
          clubData.players = await Player(mass).find({ ref: { $in: clubData.tactics.squad } });

          const squad = clubData.players.map(({ ref, energy, injury: { daysLeftToRecovery }, competition }) => ({
            ref,
            energy,
            competition,
            roles: playerStore(ref).roles,
            rating: playerStore(ref).rating,
            injured: daysLeftToRecovery,
            suspended: competition[matchType].suspended,
          }));

          // _________________ prevent Match Fixing
          clubData.matchFixedPoint = squad.reduce(
            (total, { energy, injured, suspended, roles }, index) =>
              total +
              (index <= 10
                ? energy < 20 || suspended || injured || !roles.includes(roleList[clubData.tactics.formation][index])
                  ? 1
                  : 0
                : 0),
            0
          );

          // if >4 suspected match fixed points, autoSet Formation
          if (clubData.matchFixedPoint >= 5) {
            const reserveSquad = squad
              .filter(({ injured, energy, suspended }) => !injured && energy >= 20 && !suspended)
              .sort((x, y) => y.rating - x.rating);

            clubData.players = [
              ...roleList[clubData.tactics.formation].map((role) => {
                return reserveSquad.splice(
                  reserveSquad.findIndex((player) => player.roles.includes(role)),
                  1
                )[0];
              }),
              ...reserveSquad,
            ];
          }

          if (ref === home) matchData.homeClubData = clubData;
          if (ref === away) matchData.awayClubData = clubData;
        }

        console.log(matchData.awayClubData.matchFixedPoint);
        console.log(matchData.homeClubData.matchFixedPoint);
      }

      // const { rating, roles } = playerStore(ref);
      // console.log(homeClubData.tacticsIssue, awayClubData.tacticsIssue);

      // console.log(homeClubData.players[0].energy);
      // console.log({ matchType, matchDate });
      // retrive specific collection of current soccermass
      // loop through each match object to get todays match
    }

    // await Player(mass).updateMany({ energy: { $lt: 95 } }, { $inc: { energy: 5 } });
  }
};
