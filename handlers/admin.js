const { playerStore, totalPlayers } = require("../source/playerStore.js");
const { clubStore, totalClubs } = require("../source/clubStore.js");
const {
  range,
  numToText,
  catchError,
  shuffleArray,
  validateRequestBody,
  getRef,
  uniqueArray,
  arrayToChunks,
  generateMatches,
  sortArr,
  sessionGenerator,
} = require("../utils/serverFunctions");
const { Club, Player, Mass, Profile } = require("../models/handler");
const { divisionList, groupList } = require("../source/constants.js");
const { massList } = require("../source/constants");
const pushMail = require("../utils/pushMail").pushMail;

const emailTemplates = require("../utils/emailTemplates").emailTemplates;

// to create/refresh new mass ::::::: add tables, calendar and topPlayers, players and clubs for new season
exports.initializeMass = async (req, res) => {
  try {
    const { password } = validateRequestBody(req.body, ["password"]);
    if (password !== process.env.OTP) throw "Auth server unable to validate admin";

    for (const mass of massList) {
      const initMassData = await Mass.findOne({ ref: mass });

      const currentYear = 2021 || new Date().getFullYear(),
        clubs = initMassData
          ? []
          : shuffleArray(
              Array(64)
                .fill()
                .map((x, i) => getRef("club", i + 1))
            ), //  randomize clubs for new mass where 0000 = premium agents, 0001 - 0064 for clubs
        cupClubs = [],
        divisionOne = [],
        divisionTwo = [],
        divisionThree = [],
        divisionFour = [];

      // relegation and promotion Handler
      if (initMassData) {
        for (const division of divisionList) initMassData[division].table.forEach((x) => clubs.push(x.club));

        const [d1, d2, d3, d4] = arrayToChunks(clubs, 16);

        divisionOne.push(...[...d1.slice(0, 13), ...d2.slice(0, 3)]);
        divisionTwo.push(...[...d1.slice(13, 16), ...d2.slice(3, 13), ...d3.slice(0, 3)]);
        divisionThree.push(...[...d2.slice(13, 16), ...d3.slice(3, 13), ...d4.slice(0, 3)]);
        divisionFour.push(...[...d3.slice(13, 16), ...d4.slice(3, 16)]);
        cupClubs.push(...d1.slice(0, 8), ...d2.slice(0, 8), ...d3.slice(0, 8), ...d4.slice(0, 8));
      } else {
        const [d1, d2, d3, d4] = arrayToChunks(clubs, 16);
        divisionOne.push(...d1);
        divisionTwo.push(...d2);
        divisionThree.push(...d3);
        divisionFour.push(...d4);
        cupClubs.push(...d1.slice(0, 8), ...d2.slice(0, 8), ...d3.slice(0, 8), ...d4.slice(0, 8));
      }

      const divisions = { divisionOne, divisionTwo, divisionThree, divisionFour };

      const initMass = async () => {
        const groups = {
          groupOne: {},
          groupTwo: {},
          groupThree: {},
          groupFour: {},
          groupFive: {},
          groupSix: {},
          groupSeven: {},
          groupEight: {},
        };

        const player = [
          { player: "player000000331", club: "club000000", mp: 0, goal: 0, assist: 0, cs: 0, yellow: 0, red: 0 },
          { player: "player000000953", club: "club000000", mp: 0, goal: 0, assist: 0, cs: 0, yellow: 0, red: 0 },
          { player: "player000001247", club: "club000000", mp: 0, goal: 0, assist: 0, cs: 0, yellow: 0, red: 0 },
          { player: "player000000954", club: "club000000", mp: 0, goal: 0, assist: 0, cs: 0, yellow: 0, red: 0 },
          { player: "player000000696", club: "club000000", mp: 0, goal: 0, assist: 0, cs: 0, yellow: 0, red: 0 },
        ];

        const playerStat = {
          cs: player,
          red: player,
          goal: player,
          assist: player,
          yellow: player,
        };

        const massData = {
          divisionOne: { ...playerStat, calendar: [] },
          divisionTwo: { ...playerStat, calendar: [] },
          divisionFour: { ...playerStat, calendar: [] },
          divisionThree: { ...playerStat, calendar: [] },
          league: { calendar: [], table: { ...groups }, ...playerStat },
          cup: { calendar: [], table: { ...groups }, ...playerStat },
        };

        // ____________________ top eight in each group
        const generateCupSchedule = async () => {
          const cupGroups = arrayToChunks(shuffleArray(cupClubs), 4);

          for (const [index, group] of cupGroups.entries()) {
            const groupName = groupList[index];
            const weeklyFixture = await generateMatches(group);

            // _________________ generate date for matches
            const datesArray = [];
            // _________________ populate the date array
            let date1 = new Date(currentYear, 9, 13); //start date
            let date2 = new Date(currentYear + 1, 4, 31); //end date

            // _________________  Get the first Wednesday in the month
            while (date1.getDay() !== 3) date1.setDate(date1.getDate() + 1);
            while (date1 < date2) datesArray.push(date1.toDateString()) && date1.setDate(date1.getDate() + 21);

            for (let i = 0; i < weeklyFixture.length; i++) {
              // ____________________ pull first date in dates array
              const date = datesArray.shift();
              // ______________________  loop through each fixture in the week
              for (const fixture of weeklyFixture[i]) {
                const [home, away] = fixture.split("@@@");
                massData.cup.calendar.push({
                  group: groupName,
                  date,
                  home,
                  hg: null,
                  ag: null,
                  away,
                });
              }
            }

            massData.cup.table[groupName] = group.map((club) => ({
              club,
              w: 0,
              d: 0,
              l: 0,
              ga: 0,
              gd: 0,
              gf: 0,
              pts: 0,
              pld: 0,
            }));
          }
        };

        //  _____________ all clubs in groups of 8
        const generateDivisionSchedule = async () => {
          for (const [division, clubs] of Object.entries(divisions)) {
            const weeklyFixture = await generateMatches(clubs);
            // generate date for matches
            const datesArray = [];

            // populate the date array
            let date1 = new Date(currentYear, 7, 20); //start date
            let date2 = new Date(currentYear + 1, 5, 31); //end date

            // Get the first Monday in the month
            while (date1.getDay() !== 1) date1.setDate(date1.getDate() + 1);

            while (date1 < date2) datesArray.push(date1.toDateString()) && date1.setDate(date1.getDate() + 7);

            for (let i = 0; i < weeklyFixture.length; i++) {
              // pull first date in dates array
              const date = datesArray.shift();

              // loop through each fixture in the week
              for (const fixture of weeklyFixture[i]) {
                const [home, away] = fixture.split("@@@");
                massData[division].calendar.push({
                  week: i + 1,
                  date,
                  home,
                  hg: null,
                  ag: null,
                  away,
                  data: {},
                });
              }
            }

            massData[division].table = clubs.map((club) => ({
              club,
              w: 0,
              d: 0,
              l: 0,
              ga: 0,
              gd: 0,
              gf: 0,
              pts: 0,
              pld: 0,
            }));
          }
        };

        const generateLeagueSchedule = async () => {
          const leagueGroups = arrayToChunks(shuffleArray(clubs), 8);

          for (const [index, group] of leagueGroups.entries()) {
            const groupName = groupList[index];
            const weeklyFixture = await generateMatches(group);

            // _________________ generate date for matches
            const datesArray = [];
            // _________________ populate the date array
            let date1 = new Date(currentYear, 8, 13); //start date
            let date2 = new Date(currentYear + 1, 4, 31); //end date

            // _________________  Get the first Saturday in the month
            while (date1.getDay() !== 6) date1.setDate(date1.getDate() + 1);
            while (date1 < date2) datesArray.push(date1.toDateString()) && date1.setDate(date1.getDate() + 14);

            for (let i = 0; i < weeklyFixture.length; i++) {
              // ____________________ pull first date in dates array
              const date = datesArray.shift();
              // ______________________  loop through each fixture in the week
              for (const fixture of weeklyFixture[i]) {
                const [home, away] = fixture.split("@@@");
                massData.league.calendar.push({
                  group: groupName,
                  date,
                  home,
                  hg: null,
                  ag: null,
                  away,
                });
              }
            }

            massData.league.table[groupName] = group.map((club) => ({
              club,
              w: 0,
              d: 0,
              l: 0,
              ga: 0,
              gd: 0,
              gf: 0,
              pts: 0,
              pld: 0,
            }));
          }
        };

        await generateCupSchedule();
        await generateLeagueSchedule();
        await generateDivisionSchedule();

        massData.cup.calendar.sort((x, y) => {
          if (x.week > y.week) return 1;
          if (x.week < y.week) return -1;
        });

        massData.league.calendar.sort((x, y) => {
          if (x.week > y.week) return 1;
          if (x.week < y.week) return -1;
        });

        return massData;
      };

      const initClubs = async ({ playersData }) => {
        const massClubs = [];
        let i = 1;

        while (i <= totalClubs) {
          const { ref, capacity } = clubStore(getRef("club", i));

          massClubs.push({
            ref,
            formation: "433A",
            "history.lastFiveMatches": ["win", "win", "win", "win", "win"],
            budget: Math.round(((200000 - capacity) * 2.3 - capacity) / 1000),
            "nominalAccount.sponsor": Math.round(((200000 - capacity) * 1.5 - capacity) / 1000),
            "tactics.squad": playersData.filter(({ club }) => club === ref).map(({ ref }) => ref),
          });

          i++;
        }

        return massClubs;
      };

      const initPlayers = async () => {
        const massPlayers = [];

        let i = 1;
        while (i <= totalPlayers) {
          const { ref, rating, parentClub } = playerStore(getRef("player", i));

          massPlayers.push({
            ref,
            energy: range(55, 75),
            club: rating >= 87 ? "club000000" : parentClub,
          });

          i++;
        }

        return massPlayers;
      };

      // fetch data for each collection
      const playersData = await initPlayers();
      const clubsData = await initClubs({ playersData });
      const massData = await initMass();

      if (initMassData) {
        const clubsData = {},
          clubsDivision = [
            ...massData.divisionOne.table.map((x) => ({ club: x.club, division: "divisionOne" })),
            ...massData.divisionTwo.table.map((x) => ({ club: x.club, division: "divisionTwo" })),
            ...massData.divisionThree.table.map((x) => ({ club: x.club, division: "divisionThree" })),
            ...massData.divisionFour.table.map((x) => ({ club: x.club, division: "divisionFour" })),
          ];

        await Mass.updateOne(
          { ref: mass },
          {
            divisions,
            ...massData,
            $inc: { season: 1 },
            $push: {
              news: {
                $each: [
                  {
                    title: `${new Date().toDateString()} ~ A new season is here`,
                    content: `
                  @(mass,${mass},sponsor), welcomes you to a new season. It's that time of the year where plan ahead of time. Make Transfer Decisions and Set your target for the season.`,
                    image: `/soccermass.webp`,
                  },
                ],
                $slice: 15,
                $position: 0,
              },
            },
          }
        );

        await Player(mass).collection.drop();
        // _______________ create mass players collection
        await Player(mass).insertMany(playersData);

        for (const x of playersData) {
          const { ref, club } = x;
          if (clubsData[club] === undefined) {
            clubsData[club] = [];
            clubsData[club].push(ref);
          } else {
            clubsData[club].push(ref);
          }
        }
        for (const [club, players] of Object.entries(clubsData)) {
          await Club(mass)
            .findOneAndUpdate(
              { ref: club },
              {
                $set: {
                  "tactics.squad": players,
                  "history.match": { won: 0, lost: 0, tie: 0, goalFor: 0, goalAgainst: 0 },
                },
                $inc: {
                  budget: Math.round(process.env.MAX_BUDGET / (clubsDivision.findIndex((y) => y.club === club) + 1)),
                },
              },
              { new: true }
            )
            .then(async (x) => {
              if (x?.email) {
                await Profile.updateOne({ email: x.email }, { division: clubsDivision.find((y) => y.club === x.ref).division });
              }
            })
            .catch((err) => {
              throw err;
            });
        }
      } else {
        // add mass to masses collection
        await Mass.create({
          ref: mass,
          divisions,
          ...massData,
          transfer: [
            { from: "club000001", to: "club000031", fee: 222, player: "player000000955", date: Date.now() },
            { from: "club000021", to: "club000001", fee: 145, player: "player000000019", date: Date.now() },
            { from: "club000033", to: "club000031", fee: 145, player: "player000000954", date: Date.now() },
            { from: "club000058", to: "club000003", fee: 126, player: "player000000083", date: Date.now() },
            { from: "club000012", to: "club000001", fee: 125, player: "player000000013", date: Date.now() },
          ],
          news: [
            {
              title: "Tips and Tricks",
              image: "/layout/indexSignup.png",
              content: `It's necessary you understand how and why the game was built to get the most from it. To be a succesfull Manager here requires a lot and the first is to understand how to get better match result. You'll learn a lot from visiting the mass/info page`,
              date: new Date(),
            },
            {
              title: "You've been offered a 3-year contract",
              image: "/layout/media.png",
              content: `The quote “Rome wasn't built in a day” means that it takes time to create great work, and that while you cannot expect success to come right away, it will be achieved with continued persistence. “Whatever Your Mind Can Conceive and Believe, It Can Achieve.” – Napoleon Hill`,
              date: new Date(),
            },
            {
              title: "Beware of the fans",
              image: "/layout/fans.png",
              content: `The Fans are the most important aspect in the game, and once you've built trust, they will lead your team through whatever storm that comes in the way, be careful not to upset them lest you risk the wrath of board coupled with negative match result and financial limitations`,
              date: new Date(),
            },
            {
              title: "Relaunch Date: 1st January 2022",
              image: "/layout/indexPlayers.png",
              content: `SoccerMASS Team: We are happy to announce that we have conpleted the rebuilding of SoccerMASS. The following improvements are obvious: Improved Layout, Easy Navigation, Improved transfer structure and regulation, Optimization and speed improvement.`,
              date: new Date(),
            },
            {
              title: "Welcome to SoccerMASS",
              image: "/soccermass.webp",
              content: `With joy in our heart, we gladly welcome you to the most competitive SoccerMASS: Online soccer manager, Take your team to the peak and leave no space in your Trophy shelf`,
              date: new Date(),
            },
          ],
        });
        // create mass clubs collection
        await Club(mass).insertMany(clubsData);
        // create mass players collection
        await Player(mass).insertMany(playersData);
      }
    }
    await require("../library/weeklyTask/formation")({ all: true });
    console.log(`Server Task at ${new Date().toDateString()} was succesfull`);
    res.status(200).json("successful");
  } catch (err) {
    return catchError({ res, err, message: "cannot create  mass right now" });
  }
};

exports.matchTask = async (req, res) => {
  try {
    const { mass, password } = validateRequestBody(req.body, ["mass", "password"]);
    if (password !== process.env.OTP) throw "Auth server unable to validate admin";

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    const datesArray = uniqueArray(
      sortArr([...massData.cup.calendar, ...massData.divisionOne.calendar, ...massData.league.calendar], "date")
    )
      .filter((x) => x.hg === null && x.ag === null)
      .map((x) => x.date);

    const day = new Date(datesArray[0]).getDay(),
      matchDate = new Date(datesArray[0]).toDateString(),
      matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

    switch (matchType) {
      case "cup":
        require("../library/matchTask/cup")({ matchType, matchDate });
        break;
      case "league":
        require("../library/matchTask/league")({ matchType, matchDate });
        break;
      case "division":
        require("../library/matchTask/division")({ matchType, matchDate });
        break;
      default:
        break;
    }

    console.log({ matchDate, matchType, "task Complete": datesArray[0] });

    // console.log(datesArray[0]);

    // datesArray.slice(0, datesArray.length - 18).forEach((x) => console.log(x));

    // _______________ Match Task

    // // module.exports = async ({ res, datesArray }) => {
    // //   // for (const date of datesArray.filter((_, i) => i <= 10)) {
    // //   for (const date of datesArray) {
    // //     const matchDate = new Date(date).toDateString(),
    // //       day = new Date(date).getDay(),
    // //       matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

    // //     switch (matchType) {
    // //       case "league":
    // //         await require("./league")({ matchType, matchDate, res });
    // //         break;
    // //       case "cup":
    // //         await require("./cup")({ matchType, matchDate, res });
    // //         break;
    // //       case "division":
    // //         await require("./division")({ matchType, matchDate, res });
    // //         break;
    // //       default:
    // //         break;
    // //     }
    // //   }
    // // };

    // await require("../library/matchTask")({ datesArray: datesArray.slice(0, datesArray.length - 18), res });

    console.log(`Server Task at ${new Date().toDateString()} was succesfull`);
    res.status(200).json("success");
  } catch (err) {
    return catchError({ res, err, message: "error occured" });
  }
};

exports.dailyTask = async (req, res) => {
  try {
    const { password } = validateRequestBody(req.body, ["password"]);
    if (password !== process.env.OTP) throw "Auth server unable to validate admin";

    require("../library/dailyTask")();

    res.status(200).json("successful");
  } catch (err) {
    return catchError({ res, err, message: "error occured" });
  }
};

exports.weeklyTask = async (req, res) => {
  try {
    const { password } = validateRequestBody(req.body, ["password"]);
    if (password !== process.env.OTP) throw "Auth server unable to validate admin";

    require("../library/weeklyTask")();

    res.status(200).json("successful");
  } catch (err) {
    return catchError({ res, err, message: "error occured" });
  }
};

exports.starter = async (req, res) => {
  try {
    const { password } = validateRequestBody(req.body, ["password"]);
    if (password !== process.env.OTP) throw "Auth server unable to validate admin";

    // const massData = await Mass.findOne({ ref: mass });
    // if (!massData) throw "Club not found";
    // const clubData = await Club(mass).findOne({ ref: club });
    // if (!clubData) throw "Club not found";

    // require("../library/matchTask/cup")({ matchDate: "Wed Jan 05 2022", matchType: "cup" });

    require("../library/weeklyTask");

    // const dailyTask = require("../library/dailyTask");

    // console.log(dailyTask, typeof dailyTask);

    // await require("../library/dailyTask")();

    // res.status(200).json(require("../library/dailyTask/replyUnmanaged")());
    res.status(200).json("successful");
  } catch (err) {
    console.log(err);
    return catchError({ res, err, message: "error occured" });
  }
};
