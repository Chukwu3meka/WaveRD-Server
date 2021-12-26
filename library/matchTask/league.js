const { Masses, clubs, players } = require("../../models/handler");
const { divisions, gamePos, injuryList, massList } = require("../library/constants");
const { randomValue, sortArray } = require("../library/commonFunc");

// for league matches
module.exports.playLeagueMatch = async ({ matchType, matchDate }) => {
  // list of divisions with current match type apended
  const massDiv = [];
  divisions.forEach((x) => massDiv.push(`${x}_${matchType}`));
  // match oject to store match for all masses
  const matchObject = [],
    goalers = [];
  // loop through each mass in  massList
  for (const soccermass of massList) {
    // compute difference between two values
    const computeDiff = (x, y) => x - y;
    // retrive specific collection of current soccermass
    const massObj = await Masses.find({ soccermass });
    // loop through each match object to get todays match
    const todaysMatch = [];

    for (const leagueType of massDiv) {
      const leagueTypeCal = massObj[0][leagueType].calendar;
      for (const match of leagueTypeCal) {
        // extract today's match from massObj
        if (match.date === matchDate) {
          const { home, away } = match;
          // append division type to fixture
          const fixture = { home, away, leagueType };
          todaysMatch.push(fixture);
        }
      }
    }
    for (const match of todaysMatch) {
      const { home, away } = match;
      // fetch match clubs
      const matchClubArray = [home, away];
      //store HomeTeam && AwayTeam match stat here
      const clubs = {};
      for (const club of matchClubArray) {
        const clubid = `${soccermass}@${club}`.replace(/ /g, "_").toLowerCase();
        const Clubs = clubs(soccermass);
        const Players = players(clubid);
        const formation = await Clubs.findOne({ club }).then((res) => res.stat.formation);
        // get squad playing match
        let team1 = await Players.find({});
        console.log(`************************************* ${club} *************************************`);
        // prevent match fixing ***** get how many players are in wrong pos
        let = playersWithIssue = 0;
        team1
          .sort((x, y) => x.slot.sn - y.slot.sn)
          .some((x) => {
            if (x.slot.sn <= 17) {
              const { slot, position: naturalPos, stat } = x;
              const { sn, injury } = slot;
              const inGamePos = gamePos[formation][sn];
              const suspended = stat[matchType].yellow + stat[matchType].red + injury;
              const wrongPos = sn <= 10 ? (naturalPos === inGamePos ? 0 : 1) : 0;
              playersWithIssue = playersWithIssue + wrongPos + suspended;
              if (playersWithIssue >= 4) return true;
            }
          });

        // if >4 players are in wrong pos then match fixed
        if (playersWithIssue >= 6) {
          // sort team in max rating order
          team1.sort((x, y) => y.rating - x.rating);
          // assign new slot to each player
          team1.forEach((x, index) => {
            // add extra 100 to slot for suspended  players and players with low energy
            const { slot, stat } = x;
            const { energy, injury } = slot;
            const suspended = stat[matchType].yellow + stat[matchType].red + injury;
            if (energy <= 20 || suspended) {
              x.slot.sn = index + 100;
            } else {
              x.slot.sn = index;
            }
          });
          //sort team by sn and make sn serial instead 1-... and then 101-... it will become  1 - len of team
          team1.sort((x, y) => x.slot.sn - y.slot.sn).forEach((x, index) => (x.slot.sn = index));
          const new11Squad = [];
          const new11GamePos = [];
          let newfullSquad = [];
          // extract positions in current formation and move into new11GamePos array
          for (const slot in gamePos[formation]) {
            new11GamePos.push(gamePos[formation][slot]);
          }
          // extract players names and move into newfullsquad array
          team1.forEach((x) => newfullSquad.push({ name: x.name, position: x.position, sn: x.slot.sn }));
          // auto select players for current match by looping through each position in current formation
          new11GamePos.forEach((currentPos, slot) => {
            // loop through each players and find suitable player for current position in formtion
            newfullSquad.some((player, index, array) => {
              const { name, position, sn } = player;
              const swapSlotAndPush = () => {
                // find player and update slot.sn
                team1.find((x) => x.slot.sn == slot && x.name != name && (x.slot.sn = newfullSquad.length + sn + 1000));
                team1.find((x) => x.name === name && (x.slot.sn = slot));
                // add newplayed to new11 array
                new11Squad.push(name);
                // remove player from player array to avoid duplicate
                array.splice(index, 1);
                return true;
              };
              if ("gk" === currentPos && ["gk"].includes(position)) {
                return swapSlotAndPush();
              }
              if (["cb", "dm"].includes(currentPos) && ["dm", "cb"].includes(position)) {
                return swapSlotAndPush();
              }
              if (["rb", "lb"].includes(currentPos) && ["rb", "lb", "dm", "cb"].includes(position)) {
                return swapSlotAndPush();
              }
              if (["cm", "dm"].includes(currentPos) && ["cm", "rm", "lm", "dm", "cb"].includes(position)) {
                return swapSlotAndPush();
              }
              if (["lm", "rm"].includes(currentPos) && ["rw", "lw", "cm", "rm", "lm", "am", "lb", "rb"].includes(position)) {
                return swapSlotAndPush();
              }
              if (["rw", "lw", "am"].includes(currentPos) && ["rw", "lw", "cm", "rm", "lm", "am"].includes(position)) {
                return swapSlotAndPush();
              }
              if (["cf"].includes(currentPos) && ["rw", "lw", "cf", "cm", "am"].includes(position)) {
                return swapSlotAndPush();
              }
            });
          });
          // console.log(new11Squad);
          // *****************   CONSOLE IS ABOVE HERE   ******************** //

          team1.sort((x, y) => x.slot.sn - y.slot.sn).forEach((x, index) => (x.slot.sn = index));
          team1.sort((x, y) => x.slot.sn - y.slot.sn);
        }
        const team2 = {
          club,
          assistantCoach: playersWithIssue >= 4,
          formation,
          squad: team1,
          averageRating: 0,
          wrongPosition: 0,
          poorEnergy: 0,
          averageEnergy: 0,
          wrongGkPos: 0,
          unAvailable: 0,
          emotionUp: 0,
          emotionDown: 0,
          potentialGoal: [],
          potentialAssist: [],
          potentialYellow: [],
          potentialRed: [],
          sub: [],
          eleven: [],
          subbedIn: [],
          goal: [],
          assist: [],
          yellow: [],
          red: [],
        };
        for (const player of team1) {
          // work on only squad playing current match
          if (player.slot.sn <= 17) {
            // select required values from each player in team1 and move to playerMatchStat
            const { slot, name, position: naturalPos, rating, data, stat } = player;
            const { energy, injury, sn } = slot;
            const { emotion } = data;
            const suspended1 = stat[matchType].yellow;
            const suspended2 = stat[matchType].red;
            const inGamePos = gamePos[formation][sn];
            team2.averageRating = sn >= 0 && sn <= 10 ? team2.averageRating + rating : team2.averageRating;
            team2.averageEnergy = team2.averageEnergy + energy;
            team2.poorEnergy = team2.poorEnergy + (energy < 20 ? 1 : 0);
            team2.wrongPosition = team2.wrongPosition + (sn <= 10 ? (naturalPos === inGamePos ? 0 : 1) : 0);
            team2.wrongGkPos = sn === 0 && naturalPos !== inGamePos ? 1 : 0;
            team2.unAvailable = team2.unAvailable + [suspended1 || suspended2 >= 5 || injury ? 1 : 0];
            team2.emotionUp = team2.emotionUp + [emotion === "ecstatic" ? 2 : emotion === "blissful" ? 1 : 0];
            team2.emotionDown = team2.emotionDown + [emotion === "miserable" ? -2 : emotion === "depressed" ? -1 : 0];
            sn >= 6 && sn <= 10 && (!suspended1 || suspended2 < 5) && team2.potentialGoal.push(name);
            sn >= 5 && sn <= 9 && (!suspended1 || suspended2 < 5) && team2.potentialAssist.push(name);
            sn >= 1 && sn <= 7 && (!suspended1 || suspended2 < 5) && team2.potentialYellow.push(name);
            sn >= 2 && sn <= 6 && (!suspended1 || suspended2 < 5) && team2.potentialRed.push(name);
            sn >= 11 && sn <= 17 && (!suspended1 || suspended2 < 5) && team2.sub.push(name);
            sn >= 0 && sn <= 10 && (!suspended1 || suspended2 < 5) && team2.eleven.push(name);
          }
        }
        // compute avg. energy & rating
        team2.averageRating = Math.round(team2.averageRating / 11);
        team2.averageEnergy = Math.round(team2.averageEnergy / 11);
        // move team2 into corresponding team object (homeTeam||awayTeam)
        const xxxTeam = matchClubArray.indexOf(club) === 0 ? "homeTeam" : "awayTeam";
        // move xxxteam into clubs object
        clubs[xxxTeam] = { ...team2 };
      }
      // perform match equation here
      const generateOutcome = (clubs) => {
        const { homeTeam, awayTeam } = clubs;
        const {
          averageRating: averageRatingHome,
          wrongPosition: wrongPositionHome,
          poorEnergy: poorEnergyHome,
          averageEnergy: averageEnergyHome,
          wrongGkPos: wrongGkPosHome,
          unAvailable: suspendedHome,
          emotionUp: emotionUpHome,
          emotionDown: emotionDownHome,
        } = homeTeam;
        const {
          averageRating: averageRatingAway,
          wrongPosition: wrongPositionAway,
          poorEnergy: poorEnergyAway,
          averageEnergy: averageEnergyAway,
          wrongGkPos: wrongGkPosAway,
          unAvailable: suspendedAway,
          emotionUp: emotionUpAway,
          emotionDown: emotionDownAway,
        } = awayTeam;

        // home diff
        const homeAvgRatingDiff = computeDiff(averageRatingHome, averageRatingAway);
        const homeAvgEnergyDiff = computeDiff(averageEnergyHome, averageEnergyAway);
        const homeEmotioUp = computeDiff(emotionUpHome, emotionUpAway);
        const homeEmotioDown = computeDiff(emotionDownHome, emotionDownAway);
        // away Diff
        const awayAvgRatingDiff = computeDiff(averageRatingAway, averageRatingHome);
        const awayAvgEnergyDiff = computeDiff(averageEnergyAway, averageEnergyHome);
        const awayEmotioUp = computeDiff(emotionUpAway, emotionUpHome);
        const awayEmotioDown = computeDiff(emotionDownAway, emotionDownHome);

        const totalGoalsFunc = (
          avgRatingDiff,
          wrongPosition,
          poorEnergy,
          avgEnergyDiff,
          wrongGkPos,
          suspended,
          emotioUp,
          emotioDown
        ) => {
          let totalGoals = 0;
          // avg team rating
          totalGoals = avgRatingDiff > 0 && avgRatingDiff <= 2 ? totalGoals + 2 : totalGoals;
          totalGoals = avgRatingDiff > 2 && avgRatingDiff <= 4 ? totalGoals + 3 : totalGoals;
          totalGoals = avgRatingDiff > 4 && avgRatingDiff <= 6 ? totalGoals + 4 : totalGoals;
          totalGoals = avgRatingDiff > 6 && avgRatingDiff <= 8 ? totalGoals + 5 : totalGoals;
          totalGoals = avgRatingDiff > 8 ? totalGoals + 6 : totalGoals;
          // average players energy
          totalGoals = avgEnergyDiff >= 50 && avgEnergyDiff < 100 ? totalGoals + 2 : totalGoals;
          totalGoals = avgEnergyDiff >= 100 && avgEnergyDiff < 150 ? totalGoals + 3 : totalGoals;
          totalGoals = avgEnergyDiff >= 150 && avgEnergyDiff < 200 ? totalGoals + 4 : totalGoals;
          totalGoals = avgEnergyDiff >= 200 ? totalGoals + 5 : totalGoals;
          // players in wrong position
          totalGoals = wrongPosition === 4 ? totalGoals - 1 : totalGoals;
          totalGoals = wrongPosition === 5 ? totalGoals - 2 : totalGoals;
          totalGoals = wrongPosition > 6 ? totalGoals - 3 : totalGoals;
          // players with energy < 20
          totalGoals = poorEnergy >= 2 && poorEnergy <= 3 ? totalGoals - 1 : totalGoals;
          totalGoals = poorEnergy > 4 ? totalGoals - 2 : totalGoals;
          // wrong gk
          totalGoals = wrongGkPos ? totalGoals - 3 : totalGoals;
          // unAvailable players added to match squad
          totalGoals = suspended >= 1 && suspended <= 3 ? totalGoals - 1 : totalGoals;
          totalGoals = suspended >= 4 ? totalGoals - 2 : totalGoals;
          // player emotion before game
          totalGoals = emotioUp >= 2 && emotioUp <= 4 ? totalGoals + 1 : totalGoals;
          totalGoals = emotioUp > 4 ? totalGoals + 2 : totalGoals;
          totalGoals = emotioDown >= 2 && emotioDown <= 4 ? totalGoals - 1 : totalGoals;
          totalGoals = emotioDown > 4 ? totalGoals - 2 : totalGoals;

          return totalGoals;
        };
        let homeGoal = totalGoalsFunc(
          homeAvgRatingDiff,
          wrongPositionHome,
          poorEnergyHome,
          homeAvgEnergyDiff,
          wrongGkPosHome,
          suspendedHome,
          homeEmotioUp,
          homeEmotioDown
        );
        let awayGoal = totalGoalsFunc(
          awayAvgRatingDiff,
          wrongPositionAway,
          poorEnergyAway,
          awayAvgEnergyDiff,
          wrongGkPosAway,
          suspendedAway,
          awayEmotioUp,
          awayEmotioDown
        );
        Math.round(Math.random() * (10 - 0) + 0);
        homeGoal = randomValue(homeGoal + 2, homeGoal < 1 ? 0 : homeGoal);
        awayGoal = randomValue(awayGoal + 1, awayGoal < 1 ? 0 : awayGoal);
        homeGoal = homeGoal < 1 ? 0 : homeGoal > 5 ? 3 : homeGoal;
        awayGoal = awayGoal < 1 ? 0 : awayGoal > 5 ? 3 : awayGoal;
        return { homeGoal, awayGoal };
      };
      const result = generateOutcome(clubs);
      let { homeGoal, awayGoal } = result;

      const homeEvent = [];
      const awayEvent = [];

      const generateEvent = (xxxGoal, xxxTeam, xxxEvent) => {
        // goals and assist
        for (count = 0; count < xxxGoal; count++) {
          const iGoal = Math.round(Math.random() * (clubs[xxxTeam].potentialGoal.length - 1));
          const assisted = !!Math.round(Math.random());
          const iAssist = assisted && Math.round(Math.random() * (clubs[xxxTeam].potentialAssist.length - 1));
          const goal = clubs[xxxTeam].potentialGoal[iGoal];
          const assist = clubs[xxxTeam].potentialAssist[iAssist];
          const time = Math.round(Math.random() * 93);
          xxxEvent.push({
            event: "goal",
            goal,
            assist: assisted && goal !== assist ? assist : null,
            time,
          });
        }
        const subsArray = [];
        // substitution
        for (count = 0; count < 3; count++) {
          const time = randomValue(93, 60);
          //get player from 7 reserve players as sub in and confirm that player is not a keeper
          const subInPlayer = clubs[xxxTeam].squad.find((x) => x.name === clubs[xxxTeam].sub[randomValue(6, 0)]);
          const subIn = subInPlayer ? (subInPlayer.position === "gk" ? null : subInPlayer.name) : null;
          //get sub out player in first 11 and verify that sub out is not already in subs array
          const subOutPlayer = clubs[xxxTeam].eleven[randomValue(10, 1)];
          const subOut = subsArray.includes(subOutPlayer) ? null : subOutPlayer;
          // check if subIn and subout is valid and that subin is not in subout array
          if (subIn && subOut && !subsArray.includes(subIn)) {
            // check if sub time is not greater than goal||assist time if player scored
            const playerEvent = xxxEvent.filter((x) => x.event === "goal").find((x) => x.goal === subOut || x.assist === subOut);
            const validTime = playerEvent ? (playerEvent.time > time ? false : true) : true;
            if (validTime) {
              subsArray.push(subIn, subOut);
              xxxEvent.push({ event: "substitute", time, subIn, subOut });
            }
          }
        }
        // yellow card
        const probOfYC = Math.round(Math.random() * 2);
        for (count = 0; count < probOfYC; count++) {
          const time = Math.round(Math.random() * 93);
          const player = clubs[xxxTeam].eleven[Math.round(Math.random() * 10)];
          // verify that subbed player time do not exceed yellow card time
          const status = xxxEvent
            .filter((x) => x.event === "substitute")
            .every((x) => {
              const involved = x.subOut === player || x.subIn === player;
              if (involved && time > x.time) false;
              return true;
            });
          status &&
            xxxEvent.push({
              event: "yellow",
              time,
              player,
            });
        }
      };
      generateEvent(homeGoal, "homeTeam", homeEvent);
      generateEvent(awayGoal, "awayTeam", awayEvent);

      // to generate match statistics
      const matchStat = {
        possesion: [],
        saves: [randomValue(3, 0), randomValue(2, 0)],
        shots: [randomValue(20, 3), randomValue(15, 3)],
        shotsOnTarget: [randomValue(10, 0), randomValue(8, 0)],
        passAccuracy: [randomValue(90, 55), randomValue(85, 50)],
        attacks: [randomValue(30, 2), randomValue(15, 0)],
        tackles: [randomValue(15, 3), randomValue(10, 2)],
        freekick: [randomValue(7, 2), randomValue(5, 0)],
        corner: [randomValue(4, 0), randomValue(3, 0)],
      };

      const avgRateHome = computeDiff(clubs.homeTeam.averageRating, clubs.awayTeam.averageRating);
      const avgRateAway = computeDiff(clubs.awayTeam.averageRating, clubs.homeTeam.averageRating);
      // possesion
      let tempPos; // store temp home pos
      if (avgRateHome >= 5 && avgRateHome <= 20) {
        tempPos = randomValue(60, 53);
        matchStat.possesion = [tempPos, 100 - tempPos];
      } else if (avgRateHome > 20) {
        tempPos = randomValue(75, 60);
        matchStat.possesion = [tempPos, 100 - tempPos];
      } else if (avgRateAway >= 5 && avgRateAway <= 20) {
        tempPos = randomValue(60, 53);
        matchStat.possesion = [100 - tempPos, tempPos];
      } else if (avgRateAway > 20) {
        tempPos = randomValue(75, 60);
        matchStat.possesion = [100 - tempPos, tempPos];
      } else {
        tempPos = randomValue(53, 47);
        matchStat.possesion = [tempPos, 100 - tempPos];
      }

      const fixturePlayed = {
        goals: `${homeGoal} - ${awayGoal}`,
        fixture: match,
        homeEvent,
        awayEvent,
        home11: clubs.homeTeam.eleven,
        homeSub: clubs.homeTeam.sub,
        away11: clubs.awayTeam.eleven,
        awaySub: clubs.awayTeam.sub,
        homeFormation: clubs.homeTeam.formation,
        awayFormation: clubs.awayTeam.formation,
        ...matchStat,
      };
      // get players that were subbed in
      const getPlayersInEvent = (event, team) => {
        // save to set so i can update it in mass
        clubs[team].playersWithGoal = [];
        clubs[team].playersWithAssist = [];
        // add subbed in player to team2 object in approx. line 131
        fixturePlayed[event].forEach((x) => {
          // get subbedin
          if (x.event === "substitute") clubs[team].subbedIn.push(x.subIn);
          // get goal scorers
          if (x.event === "goal") {
            const pG = clubs[team].playersWithGoal.find((player) => player.name === x.goal && (player.goal = player.goal + 1));
            if (!pG) clubs[team].playersWithGoal.push({ name: x.goal, goal: 1 });
            const pA =
              x.assist &&
              clubs[team].playersWithAssist.find((player) => player.name === x.assist && (player.assist = player.assist + 1));
            if (!pA && x.assist) clubs[team].playersWithAssist.push({ name: x.assist, assist: 1 });
          }
          // get yellow & red
          if (x.event === "yellow") clubs[team].yellow.push(x.player);
          if (x.event === "red") clubs[team].red.push(x.player);
        });
      };
      // console.log(clubs[team].scorer);
      getPlayersInEvent("homeEvent", "homeTeam");
      getPlayersInEvent("awayEvent", "awayTeam");

      // updata data for each player in squad object
      ["awayTeam", "homeTeam"].forEach((team) => {
        const index = team === "homeTeam" ? 0 : 1;
        clubs[team].squad.forEach((player) => {
          // get club formation
          const formation = clubs[team].formation;
          // destructure players
          const { slot, name, position: naturalPos, rating } = player;
          const { energy, sn } = slot;
          const inGamePos = gamePos[formation][sn];
          // get club number ofsaves
          let matchSaves = fixturePlayed.saves[index];
          // player/keepersavein game
          const saveValue = randomValue(matchSaves, 0);

          // players that played match
          if (sn <= 10 || clubs[team].subbedIn.includes(name)) {
            // reduce energy
            player.slot.energy =
              energy - [process.env.NODE_ENV === "production" ? (rating >= 75 ? 25 : clubs[team].subbedIn.includes(name) ? 15 : 35) : 0];
            // add injury
            if (player.slot.energy <= 3) {
              const injuryForm = injuryList[Math.floor(Math.random() * injuryList.length)];
              player.slot.injury = injuryForm[1];
              player.slot.injuryType = injuryForm[0];
            }
            // get player goal and assist
            const pGoal = clubs[team].playersWithGoal.find((x) => x.name === name);
            const pAssist = clubs[team].playersWithAssist.find((x) => x.name === name);
            // update player data
            player.data.mp = Number(player.data.mp) + 1;
            player.data.goal = pGoal ? pGoal.goal + player.data.goal : player.data.goal;
            player.data.assist = pAssist ? pAssist.assist + player.data.assist : player.data.assist;
            if (sn < 5 && matchSaves) {
              player.data.save = Number(player.data.save) + saveValue;
              matchSaves = matchSaves - saveValue;
            }
            if (sn === 5 && matchSaves) {
              player.data.save = Number(player.data.save) + matchSaves;
            }
            player.data.rightPosition = naturalPos === inGamePos && Number(player.data.rightPosition) + 1;
            player.data.wrongPosition = naturalPos !== inGamePos && Number(player.data.wrongPosition) + 1;
            player.data.session = Number(player.data.session) + 1;
            // update player stat
            player.stat[matchType].mp = player.stat[matchType].mp + 1;
            player.stat[matchType].yellow = clubs[team].yellow.includes(name) && Number(player.stat[matchType].yellow) + 1;
            player.stat[matchType].red = clubs[team].red.includes(name) && Number(player.stat[matchType].red) + 3;
            player.stat[matchType].goal = pGoal ? pGoal.goal + player.stat[matchType].goal : player.stat[matchType].goal;
            player.stat[matchType].assist = pAssist ? pAssist.assist + player.stat[matchType].assist : player.stat[matchType].assist;
            if (sn < 5 && matchSaves) {
              player.stat[matchType].save = Number(player.stat[matchType].save) + saveValue;
              matchSaves = matchSaves - saveValue;
            }
            if (sn === 5 && matchSaves) player.stat[matchType].save = Number(player.stat[matchType].save) + matchSaves;
          } else {
            // update player data
            player.data.session = Number(player.data.session) - 1;
            // update player stat
            player.stat[matchType].yellow = player.stat[matchType].yellow && Number(player.stat[matchType].yellow) - 1;
            player.stat[matchType].red = player.stat[matchType].red && Number(player.stat[matchType].red) - 1;
          }
        });
      });

      // delete and add new squad to database
      const currentMatch = [home, away];
      const currentMatchGoal = [homeGoal, awayGoal];
      const clubsTeam = ["homeTeam", "awayTeam"];
      const leagueType = match.leagueType;
      for (const club of currentMatch) {
        const clubid = `${soccermass}@${club}`.replace(/ /g, "_").toLowerCase();
        const Clubs = clubs(soccermass);
        const Players = players(clubid);
        const index = currentMatch.indexOf(club);
        const opponent = currentMatch[index === 0 ? 1 : 0];
        const myGoal = currentMatchGoal[index];
        const oppGoal = currentMatchGoal[index === 0 ? 1 : 0];
        const teamMoral = myGoal > oppGoal ? 3 : myGoal === oppGoal ? 1 : -3;
        const fearFactor = myGoal > oppGoal ? 1 : myGoal === oppGoal ? 0 : -1;
        const assistantCoach = clubs[clubsTeam[index]].assistantCoach;

        // delete and re-create collection
        await Players.collection.drop();
        await Players.insertMany(clubs[clubsTeam[index]].squad);
        // update clubs
        const assistantCoachDB = await Clubs.findOne({ club }).then((res) => res.assistantCoach);
        await Clubs.updateOne(
          { club },
          {
            $inc: {
              "stat.teamMoral": teamMoral,
              "stat.fearFactor": fearFactor,
              "history.won": myGoal > oppGoal ? 1 : 0,
              "history.lost": myGoal < oppGoal ? 1 : 0,
              "history.draw": myGoal === oppGoal ? 1 : 0,
              "history.goalFor": myGoal,
              "history.goalAgainst": oppGoal,
            },
            $set: {
              assistantCoach: assistantCoach ? (assistantCoachDB ? assistantCoachDB + 1 : 1) : 0,
            },
            $push: {
              pastMatch: {
                $each: [fixturePlayed],
                $slice: -2,
              },
              reports: {
                $each: [
                  {
                    detail: "Match Result",
                    content: `Our match against ${opponent} has finished, and we ${
                      myGoal > oppGoal ? "won" : myGoal === oppGoal ? "drew" : "lost"
                    } the match by ${homeGoal} goals to ${awayGoal}`,
                    pic: `club/${opponent}.webp`,
                  },
                ],
                $slice: -20,
              },
            },
          }
        );
        // // update table in Masses
        await Masses.updateOne(
          { soccermass, [`${leagueType}.table`]: { $elemMatch: { club } } },
          {
            $inc: {
              [`${leagueType}.table.$.pld`]: 1,
              [`${leagueType}.table.$.w`]: myGoal > oppGoal ? 1 : 0,
              [`${leagueType}.table.$.d`]: myGoal === oppGoal ? 1 : 0,
              [`${leagueType}.table.$.l`]: myGoal < oppGoal ? 1 : 0,
              [`${leagueType}.table.$.pts`]: myGoal > oppGoal ? 3 : myGoal === oppGoal ? 1 : 0,
              [`${leagueType}.table.$.gf`]: myGoal,
              [`${leagueType}.table.$.ga`]: oppGoal,
              [`${leagueType}.table.$.gd`]: myGoal - oppGoal,
            },
          }
        );
      }
      // update topplayer in Masses

      const topPlayers = await Masses.findOne({ soccermass }).then((res) => res[leagueType]);
      let massScorers = [...topPlayers.goal];
      let massAssist = [...topPlayers.assist];
      let massSaves = [...topPlayers.saves];
      // create new array of topPlayers
      [home, away].forEach((club, index) => {
        const fullSquad = [];
        // extract full squad top player clubs
        clubs[clubsTeam[index]].squad.forEach((player) => {
          const { mp, goal, assist, save } = player.stat[matchType];
          fullSquad.push({ name: player.name, club, mp, goal, assist, saves: save });
        });
        // if club scored
        if (fixturePlayed.goals.split(" - ")[index]) {
          // remove club players from massscorrers and assit
          massScorers = massScorers.filter((x) => x.club !== club);
          massAssist = massAssist.filter((x) => x.club !== club);
          // sort players based on goal/assist and add back to massscorres and assist
          massScorers = sortArray([...massScorers, ...fullSquad]);
          massAssist = sortArray([...massAssist, ...fullSquad], "assist");
        }
        if (matchStat.saves[index]) {
          massSaves = massSaves.filter((x) => x.club !== club);
          massSaves = sortArray([...massSaves, ...fullSquad], "keeper");
        }
      });
      // update Masses collection g,a,s with new data
      await Masses.updateOne(
        { soccermass },
        {
          $set: {
            [`${leagueType}.goal`]: massScorers,
            [`${leagueType}.assist`]: massAssist,
            [`${leagueType}.saves`]: massSaves,
          },
        }
      );
      // update calendar in Masses
      await Masses.updateOne(
        { soccermass, [`${leagueType}.calendar`]: { $elemMatch: { home, away } } },
        {
          $set: {
            [`${leagueType}.calendar.$.hg`]: homeGoal,
            [`${leagueType}.calendar.$.ag`]: awayGoal,
          },
        }
      );
      matchObject.push(fixturePlayed);
    }
  }
  //****************  to short match data, return the code below  ****************//
  matchObject.forEach((x) => {
    const { fixture, goals } = x;
    const max = { ...fixture, goals };
    // short form of matchobject
    goalers.push(max);
  });
  console.log(goalers);
  return goalers;
  return matchObject;
  return "success";
};
