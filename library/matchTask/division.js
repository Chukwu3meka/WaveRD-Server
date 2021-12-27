const { Club, Player, Mass } = require("../../models/handler");
const { clubStore, totalClubs } = require("../../source/clubStore.js");
const { playerStore, totalPlayers } = require("../../source/playerStore.js");
const { massList, roleList, formationList } = require("../../source/constants");
const { scoreGenerator, range } = require("../../utils/serverFunctions");

module.exports = async ({ matchDate, matchType, res }) => {
  for (const mass of massList) {
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Club not found";

    const matchData = {};
    for (const divNum of ["divisionOne", "divisionTwo", "divisionThree", "divisionFour"]) {
      matchData[divNum] = [];

      const fixture =
        // massData[divNum].calendar.filter(({ date, home, away }) => date === matchDate && { date, home, away })
        [
          {
            home: "club000001",
            away: "club000002",
            week: 1,
          },
        ];

      for (const { home, away, week } of fixture) {
        let homeClubData = {};
        let awayClubData = {};

        for (const ref of [home, away]) {
          const clubData = await Club(mass).findOne({ ref });

          clubData.players = await Player(mass).find({ ref: { $in: clubData.tactics.squad } });

          clubData.players = await clubData.tactics.squad
            .map((player) => clubData.players.find(({ ref }) => ref === player))
            .map(({ ref, energy, session, injury: { daysLeftToRecovery }, competition }) => ({
              ref,
              energy,
              session,
              competition,
              injured: daysLeftToRecovery,
              name: playerStore(ref).name,
              roles: playerStore(ref).roles,
              rating: playerStore(ref).rating,
              suspended: competition[matchType].suspended,
            }));

          // _________________ prevent suspende/injured players
          clubData.invalidSquad = clubData.players.reduce(
            (total, { energy, injured, suspended }, index) => total + (index <= 17 ? (energy < 20 || suspended || injured ? 1 : 0) : 0),
            0
          );

          // _________________ prevent Match Fixing
          clubData.firstElevenWrongRole = clubData.players.reduce(
            (total, { roles }, index) =>
              total + (index <= 10 ? (!roles.includes(roleList[clubData.tactics.formation][index]) ? 1 : 0) : 0),
            0
          );

          // if >4 suspected match fixed points, autoSet Formation
          if (clubData.invalidSquad || clubData.firstElevenWrongRole >= 4) {
            const fullPlayersList = clubData.players
              .filter(({ injured, energy, suspended }) => !injured && energy >= 20 && !suspended)
              .sort((x, y) => y.rating - x.rating);

            clubData.players = [
              ...roleList[clubData.tactics.formation].map((role) => {
                const index = fullPlayersList.findIndex((player) => player.roles.includes(role));

                const data = index >= 0 ? fullPlayersList[index] : fullPlayersList[fullPlayersList.length - 1];

                fullPlayersList.splice(index, 1);

                return data;
              }),
              ...fullPlayersList.slice(0, 6),
            ];
          } else {
            clubData.players = clubData.players.slice(0, 17);
            clubData.missingPlayers = clubData.players.slice(18);
          }

          clubData.tacticsPenalty = clubData.invalidSquad + clubData.firstElevenWrongRole;

          clubData.tacticsRating = Math.round(
            clubData.players
              .slice(0, 11)
              .reduce((total, curr) => total + curr.rating + (curr.session > week ? 3 : 0) - clubData.tacticsPenalty, 0) / 11
          );

          if (ref === home) homeClubData = clubData;
          if (ref === away) awayClubData = clubData;
        }

        const { gs: homeScore, matchEvent: homeMatchEvent } = scoreGenerator({
          clubData: homeClubData,
          diff: homeClubData.tacticsRating - awayClubData.tacticsRating,
        });

        const { gs: awayScore, matchEvent: awayMatchEvent } = scoreGenerator({
          clubData: awayClubData,
          diff: awayClubData.tacticsRating - homeClubData.tacticsRating,
        });

        const possesion =
          homeClubData.tacticsRating - awayClubData.tacticsRating >= 20
            ? range(70, 80)
            : homeClubData.tacticsRating - awayClubData.tacticsRating >= 10
            ? range(55, 70)
            : homeClubData.tacticsRating - awayClubData.tacticsRating >= 0
            ? range(50, 60)
            : range(20, 50);

        matchData[divNum].push({
          homeMatchEvent,
          awayMatchEvent,
          // to generate match statistics
          matchStat: {
            clubs: [home, away],
            goals: [homeScore, awayScore],
            possesion: [possesion, 100 - possesion],
            shots: [range(20, 3), range(15, 3)],
            shotsOnTarget: [range(10, 0), range(8, 0)],
            passAccuracy: [range(90, 55), range(85, 50)],
            attacks: [range(30, 2), range(15, 0)],
            tackles: [range(15, 3), range(10, 2)],
            freekick: [range(7, 2), range(5, 0)],
            corner: [range(4, 0), range(3, 0)],
            yellow: [homeMatchEvent.yellow.length, awayMatchEvent.yellow.length],
            red: [0, 0],
            saves: [range(3, 0), range(2, 0)],
          },

          home11: homeClubData.players.filter((x, i) => i <= 10),
          homeSub: homeClubData.players.filter((x, i) => i >= 11),
          homeMissing: homeClubData.missingPlayers,
          homeFormation: homeClubData.tactics.formation,

          away11: awayClubData.players.filter((x, i) => i <= 10),
          awaySub: awayClubData.players.filter((x, i) => i >= 11),
          awayMissing: awayClubData.missingPlayers,
          awayFormation: awayClubData.tactics.formation,
        });

        const updateClubHandler = async (club) => {
          const opponent = club === home ? away : home;
          const myGoal = club === home ? homeScore : awayScore;
          const oppGoal = club === home ? awayScore : homeScore;

          await Club(mass).updateOne(
            { ref: club },
            {
              $inc: {
                budget: Math.floor(
                  ((700 * clubStore(club).capacity) / 13.7 / 1000000) * (myGoal > oppGoal ? 1.5 : myGoal === oppGoal ? 1 : 0.5)
                ),
                "history.match.won": myGoal > oppGoal ? 1 : 0,
                "history.match.lost": myGoal === oppGoal ? 1 : 0,
                "history.match.tie": oppGoal > myGoal ? 1 : 0,
                "history.match.goalFor": myGoal,
                "history.match.goalAgainst": oppGoal,
              },
              $push: {
                lastFiveMatches: {
                  $each: [myGoal > oppGoal ? "win" : myGoal === oppGoal ? "tie" : "lost"],
                  $slice: -5,
                },
                reports: {
                  $each: [
                    {
                      title: "Match Result",
                      content: `Our match against 
                      @(club,${opponent},title) has ended, and we ${
                        myGoal > oppGoal ? "won" : myGoal === oppGoal ? "drew" : "lost"
                      } the match by ${homeScore} goals to ${awayScore}`,
                      image: `/club/${opponent}.webp`,
                    },
                  ],
                  $slice: -15,
                },
              },
              $set: {
                "history.match.lastMatch": {
                  away,
                  home,
                  hg: homeScore,
                  ag: awayScore,
                },
              },
            }
          );
        };
        updateClubHandler(home);
        updateClubHandler(club);
      }
    }

    return res.status(200).json(matchData.divisionOne);
  }
};
