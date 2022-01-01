const { clubStore } = require("../../source/clubStore.js");
const { Club, Player, Mass } = require("../../models/handler");
const { playerStore } = require("../../source/playerStore.js");
const { massList, roleList, groupList } = require("../../source/constants");
const { scoreGenerator, range, sortArr } = require("../../utils/serverFunctions");

module.exports = async ({ matchDate, matchType }) => {
  for (const mass of massList) {
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Club not found";

    const newMassData = {};

    for (const group of groupList) {
      const leagueMatch = [];
      const leaguePlayers = [];

      const fixtures = massData.league.calendar.filter((fixture) => fixture.date === matchDate && fixture.group === group);

      for (const { home, away, date } of fixtures) {
        let homeClubData = {};
        let awayClubData = {};

        for (const ref of [home, away]) {
          const clubData = await Club(mass).findOne({ ref });

          clubData.initialPlayers = await Player(mass).find({ ref: { $in: clubData.tactics.squad } });

          clubData.players = clubData.tactics.squad
            .map((player) => clubData.initialPlayers.find(({ ref }) => ref === player))
            .map(({ ref, energy, session, injury: { daysLeftToRecovery }, competition }) => ({
              ref,
              energy,
              session,
              competition,
              injured: daysLeftToRecovery,
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
              ...fullPlayersList.slice(0, 7),
            ];
          } else {
            clubData.players = clubData.players.slice(0, 18);
            clubData.missingPlayers = clubData.players.slice(18);
          }

          clubData.tacticsPenalty =
            (clubData.invalidSquad || clubData.firstElevenWrongRole) >= 4
              ? clubData.invalidSquad + clubData.firstElevenWrongRole + 3
              : clubData.invalidSquad + clubData.firstElevenWrongRole;

          clubData.tacticsRating = Math.round(
            clubData.players
              .slice(0, 11)
              .reduce((total, curr) => total + curr.rating + (curr.session > 0 ? 3 : 0) - clubData.tacticsPenalty, 0) / 11
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

        const matchStat = {
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
        };

        leagueMatch.push(matchStat);

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
                lastMatch: {
                  away,
                  home,
                  hg: homeScore,
                  ag: awayScore,
                  date: Date.now(),
                  ...matchStat,
                },
              },
            }
          );
        };

        updateClubHandler(home);
        updateClubHandler(away);

        const updatePlayerHandler = (club) => {
          const matchEvent = club === home ? homeMatchEvent : awayMatchEvent;
          const clubData = club === home ? homeClubData : awayClubData;
          const oppGoal = club === home ? awayScore : homeScore;

          const featuredPlayersRef = [
            ...clubData.players.filter((x, i) => i <= 10).map((x) => x.ref),
            ...matchEvent.sub.map((x) => x.subIn),
          ].map((y, index) => {
            const x = clubData.initialPlayers.find((x) => x.ref === y);

            const yellow = matchEvent.yellow?.reduce((total, { yellow }) => (total + (x.ref === yellow) ? 1 : 0), 0);
            const goal = matchEvent.goal?.reduce((total, { goal }) => (total + (x.ref === goal) ? 1 : 0), 0);
            const assist = matchEvent.goal?.reduce((total, { assist }) => (total + (x.ref === assist) ? 1 : 0), 0);
            const injury = x.energy < 20 ? injuryList[range(0, injuryList.length)] : [x.injury.daysLeftToRecovery, x.injury.injuryType];

            return {
              club,
              ref: x.ref,
              energy: process.env.NODE_ENV !== "production" ? x.energy : x.energy - 30, // -30 per match
              session:
                x.session + (index > 10 ? 0 : playerStore(x.ref).roles.includes(roleList[clubData.tactics.formation][index]) ? 1 : 0), // played in right position emotion +1, worng position 0 else -1

              "injury.daysLeftToRecovery": injury[0],
              "injury.injuryType": injury[1],

              "history.mp": x.history.mp + 1,
              "history.goal": x.history.goal + goal,
              "history.yellow": x.history.yellow + yellow,
              "history.red": 0,
              "history.assist": x.history.assist + assist,
              "history.cs": x.history.cs + (oppGoal ? 0 : 1),

              "competition.league.red": 0,
              "competition.league.mp": x.competition.league.mp + 1,
              "competition.league.goal": x.competition.league.goal + goal,
              "competition.league.yellow": x.competition.league.yellow + yellow,
              "competition.league.assist": x.competition.league.assist + assist,
              "competition.league.cs": x.competition.league.cs + (oppGoal ? 0 : 1),
              // 5 yellow card, one match suspension
              "competition.league.suspended": yellow ? ((x.competition.league.yellow + yellow) % 5 === 0 ? 1 : 0) : 0,
            };
          });

          const nonFeaturedPlayersRef = clubData.initialPlayers
            .filter((x) => !featuredPlayersRef.map((y) => y.ref).includes(x.ref))
            .map((x) => {
              return {
                club,
                ref: x.ref,
                session: x.session - 1,
                "competition.league.mp": x.competition.league.mp,
                "competition.league.cs": x.competition.league.cs,
                "competition.league.red": 0,
                "competition.league.goal": x.competition.league.goal,
                "competition.league.yellow": x.competition.league.yellow,
                "competition.league.assist": x.competition.league.assist,
                "competition.league.suspended": x.competition.league.suspended > 0 ? x.competition.league.suspended - 1 : 0,
              };
            });
          return [...featuredPlayersRef, ...nonFeaturedPlayersRef];
        };

        // for (player of clubsSquad) {
        for (player of [...updatePlayerHandler(home), ...updatePlayerHandler(away)]) {
          leaguePlayers.push({
            player: player.ref,
            club: player.club,
            mp: player["competition.league.mp"],
            cs: player["competition.league.cs"],
            red: player["competition.league.red"],
            goal: player["competition.league.goal"],
            assist: player["competition.league.assist"],
            yellow: player["competition.league.yellow"],
          });

          await Player(mass).updateOne({ ref: player.ref }, player);
        }

        // _____________ update calendar in Mass
        await Mass.updateOne(
          { ref: mass, "league.calendar": { $elemMatch: { home, away, date } } },
          {
            $set: {
              "league.calendar.$.hg": homeScore,
              "league.calendar.$.ag": awayScore,
            },
          }
        );
      }

      const goal = sortArr(leaguePlayers, "goal").slice(0, 10);
      const assist = sortArr(leaguePlayers, "assist").slice(0, 10);
      const cs = sortArr(leaguePlayers, "cs").slice(0, 10);
      const yellow = sortArr(leaguePlayers, "yellow").slice(0, 10);
      const red = sortArr(leaguePlayers, "red").slice(0, 10);

      const table = sortArr(
        leagueMatch.flatMap((x) => {
          const homeGoalDiff = x.matchStat.goals[0] - x.matchStat.goals[1];
          const awayGoalDiff = x.matchStat.goals[1] - x.matchStat.goals[0];

          const homeData = massData.league.table[group].find((y) => y.club === x.matchStat.clubs[0]);
          const awayData = massData.league.table[group].find((y) => y.club === x.matchStat.clubs[1]);

          return [
            {
              pld: homeData.pld + 1 || 1,
              club: x.matchStat.clubs[0],
              gf: homeData.gf + x.matchStat.goals[0],
              ga: homeData.ga + x.matchStat.goals[1],
              w: homeData.w + (homeGoalDiff > 0 ? 1 : 0),
              l: homeData.l + (homeGoalDiff < 0 ? 1 : 0),
              d: homeData.d + (homeGoalDiff === 0 ? 1 : 0),
              pts: homeData.pts + (homeGoalDiff > 0 ? 3 : homeGoalDiff === 0 ? 1 : 0),
            },
            {
              pld: awayData.pld + 1 || 1,
              club: x.matchStat.clubs[1],
              gf: awayData.gf + x.matchStat.goals[1],
              ga: awayData.ga + x.matchStat.goals[0],
              w: awayData.w + (awayGoalDiff > 0 ? 1 : 0),
              l: awayData.l + (awayGoalDiff < 0 ? 1 : 0),
              d: awayData.d + (awayGoalDiff === 0 ? 1 : 0),
              pts: awayData.pts + (awayGoalDiff > 0 ? 3 : awayGoalDiff === 0 ? 1 : 0),
            },
          ];
        }),
        "table"
      );

      newMassData[`league.cs`] = cs;
      newMassData[`league.red`] = red;
      newMassData[`league.goal`] = goal;
      newMassData[`league.assist`] = assist;
      newMassData[`league.yellow`] = yellow;
      newMassData[`league.table.${group}`] = table;
    }

    // update mass Data
    await Mass.updateOne({ ref: mass }, newMassData);
  }
};
