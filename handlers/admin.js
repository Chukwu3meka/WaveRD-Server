const { playerStore, totalPlayers } = require("../source/playerStore.js");
const { clubStore, totalClubs } = require("../source/clubStore.js");
const { range, numToText, catchError, shuffleArray, validateRequestBody, getRef, arrayToChunks } = require("../utils/serverFunctions");
const { Club, Player, Mass, Profile } = require("../models/handler");

// to create/refresh new mass ::::::: add tables, calendar and topPlayers, players and clubs for new season
exports.initializeMass = async (req, res) => {
  try {
    const { mass, password } = validateRequestBody(req.body, ["mass", "password"]);
    if (password !== process.env.OTP) throw "Auth server unable to validate admin";

    const dbMassData = await Mass.findOne({ ref: mass });

    //  randomize clubs for new mass where 0000 = premium agents, 0001 - 0064 for clubs

    const divisions = {},
      clubs = dbMassData ? [] : shuffleArray([...Array(64).keys()].map((x) => getRef("club", x + 1)));

    // relegation and promotion Handler
    if (dbMassData) {
      for (const division of ["divisionOne", "divisionTwo", "divisionThree", "divisionFour"]) {
        dbMassData[division].table.forEach((x) => clubs.push(x.club));
      }
      const [divisionOne, divisionTwo, divisionThree, divisionFour] = arrayToChunks(clubs, 16);
      divisions.divisionOne = [...divisionOne.splice(0, 13), ...divisionTwo.splice(0, 3)];
      divisions.divisionTwo = [...divisionOne.splice(0, 3), ...divisionTwo.splice(0, 10), ...divisionThree.splice(0, 3)];
      divisions.divisionThree = [...divisionTwo.splice(0, 3), ...divisionThree.splice(0, 10), ...divisionFour.splice(0, 3)];
      divisions.divisionFour = [...divisionThree.splice(0, 3), ...divisionFour.splice(0, 13)];
    } else {
      // select clubs for each division
      const [divisionOne, divisionTwo, divisionThree, divisionFour] = arrayToChunks(clubs, 16);

      divisions.divisionOne = divisionOne;
      divisions.divisionTwo = divisionTwo;
      divisions.divisionThree = divisionThree;
      divisions.divisionFour = divisionFour;
    }

    const generateMatches = async (clubs) => {
      let uniqueMatches = [];
      let unusedClubs = [...clubs];

      // create unique set of matches
      for (const club of clubs) {
        for (const opp of unusedClubs.filter((x) => x !== club)) {
          // to prevent one team from always being the home team week in week out
          uniqueMatches.push(unusedClubs.filter((x) => x !== club).indexOf(opp) % 2 ? `${club}@@@${opp}` : `${opp}@@@${club}`);

          //   uniqueMatches.push(`${club}@@@${opp}`);
          unusedClubs = unusedClubs.filter((x) => x !== club);
        }
      }

      const oneLegSchedule = [...Array(clubs.length - 1).keys()].map((x) => []);

      const matchDayChecker = (matchDay, fixture) => {
        if (matchDay.length === 0) return true;

        const [club, opp] = fixture.split("@@@");
        const clubsInMatchDay = matchDay.flatMap((fixture) => fixture.split("@@@"));

        if (clubsInMatchDay.includes(opp) || clubsInMatchDay.includes(club)) return false;

        return true;
      };

      for (const matchDay of oneLegSchedule) {
        for (const fixture of uniqueMatches) {
          if (matchDayChecker(matchDay, fixture)) {
            matchDay.push(fixture);
            uniqueMatches = uniqueMatches.filter((x) => x !== fixture);
          }
        }
      }

      const schedule = [...oneLegSchedule];

      // generateAwayFixtures
      for (const fixture of oneLegSchedule) {
        schedule.push(
          fixture.map((x) => {
            const [home, away] = x.split("@@@");
            return `${away}@@@${home}`;
          })
        );
      }

      return schedule;
    };

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

      const generateCupSchedule = async () => {
        const cupGroups = arrayToChunks(shuffleArray(clubs), 8);

        for (const group of cupGroups) {
          const groupName = `group${numToText(cupGroups.indexOf(group) + 1)}`;

          const weeklyFixture = await generateMatches(group);
          // generate date for matches
          const datesArray = [];
          const currentYear = new Date().getFullYear();

          // populate the date array
          let date1 = new Date(currentYear, 7, 13); //start date
          let date2 = new Date(currentYear + 1, 4, 31); //end date

          // Get the first Monday in the month
          while (date1.getDay() !== 3) {
            date1.setDate(date1.getDate() + 1);
          }

          while (date1 < date2) {
            datesArray.push(date1.toDateString()) && date1.setDate(date1.getDate() + 14);
          }

          for (let i = 0; i < weeklyFixture.length; i++) {
            // pull first date in dates array
            const date = datesArray.shift();

            // loop through each fixture in the week
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

      const generateDivisionSchedule = async () => {
        for (const [division, clubs] of Object.entries(divisions)) {
          const weeklyFixture = await generateMatches(clubs);
          // generate date for matches
          const datesArray = [];
          const currentYear = new Date().getFullYear();

          // populate the date array
          let date1 = new Date(currentYear, 7, 13); //start date
          let date2 = new Date(currentYear + 1, 5, 31); //end date

          // Get the first Monday in the month
          while (date1.getDay() !== 1) {
            date1.setDate(date1.getDate() + 1);
          }

          while (date1 < date2) {
            datesArray.push(date1.toDateString()) && date1.setDate(date1.getDate() + 7);
          }

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
        let eligibleClubs = [];

        //       for (const group of Object.values(massData.league.table)) {
        //         for (const club of group) {
        // ["club000000",
        // "club000001",
        // "club000063",
        // "club000064",
        // "club000065",].includes(club.club)&&
        //   console.log( club.club)

        // _________ fetch eligible clubs: top 8 teams in each divisions

        while (eligibleClubs.includes(undefined) || !eligibleClubs.length) {
          for (const clubs of Object.values(divisions)) {
            eligibleClubs.push(clubs.slice(0, 8));
          }

          if (eligibleClubs.flat().includes(undefined)) {
            eligibleClubs = [];
          } else {
            eligibleClubs = shuffleArray(eligibleClubs.flat());
          }
        }

        const clubs = eligibleClubs,
          cupGroups = arrayToChunks(clubs, 4);

        for (const group of cupGroups) {
          const groupName = `group${numToText(cupGroups.indexOf(group) + 1)}`;

          const weeklyFixture = await generateMatches(group);

          // generate date for matches
          const datesArray = [];
          const currentYear = new Date().getFullYear();

          // populate the date array
          let date1 = new Date(currentYear, 7, 13); //start date
          let date2 = new Date(currentYear + 1, 4, 31); //end date

          // Get the first Monday in the month
          while (date1.getDay() !== 6) {
            date1.setDate(date1.getDate() + 1);
          }

          while (date1 < date2) {
            datesArray.push(date1.toDateString()) && date1.setDate(date1.getDate() + 14);
          }

          for (let i = 0; i < weeklyFixture.length; i++) {
            // pull first date in dates array
            const date = datesArray.shift();

            // loop through each fixture in the week
            for (const fixture of weeklyFixture[i]) {
              const [home, away] = fixture.split("@@@");
              massData.league.calendar.push({
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
          budget: Math.round(((200000 - capacity) * 1.5 - capacity) / 1000),
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
          club: rating >= 85 ? "club000000" : parentClub,
        });

        i++;
      }

      return massPlayers;
    };

    // fetch data for each collection
    const playersData = await initPlayers();
    const clubsData = await initClubs({ playersData });
    const massData = await initMass();

    if (dbMassData) {
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
          .findOneAndUpdate({ ref: club }, { "tactics.squad": players }, { new: true })
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

    return res.json("successfull");
  } catch (err) {
    return catchError({ res, err, message: "cannot create  mass right now" });
  }
};

exports.testFunctionHandler = async (req, res) => {
  try {
    const { mass, password } = validateRequestBody(req.body, ["mass", "password"]);
    if (password !== process.env.OTP) throw "Auth server unable to validate admin";

    // const emotion =    require("../library/dailyTask/emotion");
    // emotion();

    // _______________ Daily Task
    // require("../library/dailyTask/emotion")();
    // require("../library/dailyTask/energy")();
    // require("../library/dailyTask/injury")();

    // _______________ Match Task
    require("../library/matchTask/playMatch")(res);

    // const massData = await Mass.findOne({ ref: mass });
    // if (!massData) throw "Club not found";
    // const clubData = await Club(mass).findOne({ ref: club });
    // if (!clubData) throw "Club not found";
    res.status(200).json("success");
  } catch (err) {
    return catchError({ res, err, message: "error occured" });
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
