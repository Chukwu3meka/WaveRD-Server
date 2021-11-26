const { playerStore, totalPlayers } = require("../source/database/playerStore.js");
const { clubStore, totalClubs } = require("../source/database/clubStore.js");
const { range, numToText, catchError, shuffleArray, validateRequestBody, getRef, arrayToChunks } = require("../utils/serverFunctions");
const { clubModel, playerModel, Mass } = require("../models/handler");

// const { clubs, clubModel, playerModel, players, Mass, Trends } = require("../models/handler");
const { playLeagueMatch } = require("../source/playMatch/league");
const { formations } = require("../source/serverVariables.js");

// to create/refresh new mass ::::::: add tables, calendar and topPlayers, players and clubs for new season
exports.initializeMass = async (req, res) => {
  try {
    const { mass, password } = validateRequestBody(req.body, ["mass", "password"]);
    if (password !== process.env.OTP) throw "Auth server unable to validate admin";

    const dbMassData = await Mass.findOne({ ref: mass });

    let clubs = [],
      divisions = {};

    // relegation and promotion Handler
    if (dbMassData) {
      for (const division of ["divisionOne", "divisionTwo", "divisionThree", "divisionFour"]) {
        dbMassData[division].table.forEach((x) => clubs.push(x.club));
      }
      const [divisionOne, divisionTwo, divisionThree, divisionFour] = arrayToChunks(clubs, 16);
      const div1 = [...divisionOne.splice(0, 13), ...divisionTwo.splice(0, 3)];
      const div2 = [...divisionOne.splice(0, 3), ...divisionTwo.splice(0, 10), ...divisionThree.splice(0, 3)];
      const div3 = [...divisionTwo.splice(0, 3), ...divisionThree.splice(0, 10), ...divisionFour.splice(0, 3)];
      const div4 = [...divisionThree.splice(0, 3), ...divisionFour.splice(0, 13)];
      divisions = { divisionOne: div1, divisionTwo: div2, divisionThree: div3, divisionFour: div4 };
    } else {
      //  randomize clubs for new mass where 0000 = premium agents, 0001 - 0064 for clubs
      clubs = shuffleArray([...Array(64).keys()].map((x) => getRef("club", x + 1)));
      // select clubs for each division
      const [divisionOne, divisionTwo, divisionThree, divisionFour] = arrayToChunks(clubs, 16);
      divisions = { divisionOne, divisionTwo, divisionThree, divisionFour };
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

      const massData = {
        divisionOne: {},
        divisionTwo: {},
        divisionFour: {},
        divisionThree: {},
        league: { calendar: [], table: { ...groups } },
        cup: {
          calendar: [],
          table: { ...groups },
        },
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

          massData[division].calendar = [];
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
        const eligibleClubs = [];
        for (const [division, clubs] of Object.entries(divisions)) {
          // fetch eligible clubs: top 8 teams in each divisions
          eligibleClubs.push(
            // [...clubs].splice(0, division === "divisionOne" ? 8 : division === "divisionTwo" ? 8 : division === "divisionThree" ? 5 : 3)
            [...clubs].splice(0, 8)
          );
        }

        const clubs = shuffleArray(eligibleClubs.flat()),
          cupGroups = arrayToChunks(shuffleArray(clubs), 4);

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

      console.log(massData.league.table);

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

    const Clubs = clubModel(mass);
    const Players = playerModel(mass);

    if (dbMassData) {
      await Mass.updateOne({ ref: mass }, { divisions, ...massData });
      // await Clubs.collection.drop();
      await Players.collection.drop();
      // create mass players collection
      await Players.insertMany(playersData);

      const clubsData = {};
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
        await Clubs.updateOne({ ref: club }, { "tactics.squad": players });
      }

      return res.json(clubsData);
    } else {
      // add mass to masses collection
      await Mass.create({ ref: mass, divisions, ...massData });
      // create mass clubs collection
      await Clubs.insertMany(clubsData);
      // create mass players collection
      await Players.insertMany(playersData);
    }

    return res.json("successfull");
  } catch (err) {
    return catchError({ res, err, message: "cannot create  mass right now" });
  }
};

// // await Players.insertMany(playersData);
// exports.removeManager = async (req, res, next) => {
//   try {
//     let { email, club, soccermass, division } = req.body;
//     email = validate("email", email);
//     club = validate("text", club);
//     division = validate("text", division);
//     soccermass = validate("text", soccermass);
//     let status = false,
//       conditionMet = [soccermass, club, email, division].every((x) => x);
//     if (conditionMet) {
//       let isProfileValid = await Profiles.findOne({ email, soccermass });
//       isProfileValid = !!isProfileValid;
//       if (isProfileValid) {
//         status = true;
//       }
//     }
//     if (status) {
//       const Clubs = clubs(soccermass);
//       const news = {
//         detail: `${club} has dismissed their Manager.`,
//         content: `${club} has dismissed their manager as a result of breach in terms agreed with the club, and have started search for a new manager`,
//       };
//       const events = {
//         date: new Date().toDateString(),
//         event: `${club} head-coach and general manager have been dismissed. After a well cordinated investigation into his activities and profile, the tactical coach was released for a breach in terms`,
//       };
//       await Clubs.updateOne({ club }, { events, "stat.manager": null });
//       await Profiles.deleteOne({ soccermass, club, email, division });

//       //get divisions array from SoccerMASS
//       const listOfDivisions = SoccerMASSResult.divisions;
//       const noOfAvailClubsInMass = SoccerMASSResult.clubs;
//       const noOfAvailClubsInDivision = listOfDivisions.filter((x) => x[0] === division)[0][1];
//       const updatedListOfDivisions = listOfDivisions.filter((x) => x[0] !== division);
//       updatedListOfDivisions.push([division, noOfAvailClubsInDivision + 1]);
//       await Mass.updateOne(
//         { soccermass },
//         { divisions: updatedListOfDivisions, clubs: noOfAvailClubsInMass + 1, $addToSet: { news } }
//       );

//       return res.status(200).send(`${email} has been removed succesfully`);
//     }
//     res.status(404).json("Can't delete this account");
//   } catch (err) {
//     return next({ status: 404, message: "Unable to delete account" });
//   }
// };
// exports.playMatch = async (req, res, next) => {
//   try {
//     const { matchType = "League", matchDate = "Sun Oct 18 2020" } = req.body;
//     let result = [];
//     switch (matchType) {
//       case "League": {
//         result = await playLeagueMatch({ clubs, players, matchType, matchDate, Masses });
//         break;
//       }
//       case "Champions League": {
//         result = "sdsd";
//         break;
//       }
//       default:
//         break;
//     }
//     res.json(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.addNews = async (req, res, next) => {
//   try {
//     const { soccermass } = req.body;
//     const news = [];
//     req.body.news.forEach((i) => {
//       news.push({ detail: i.detail, content: i.content, pic: i.pic });
//     });
//     const result = await Masses.updateOne({ soccermass }, { news });
//     res.send(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.addMassTable = async (req, res, next) => {
//   try {
//     const { soccermass, division } = req.body;
//     const div = division.toLowerCase().replace(/ /g, "");
//     const table = [];
//     req.body.table.forEach((i) => {
//       const { club, pld, w, d, l, pts, gf, ga, gd } = i;
//       table.push({ club, pld, w, d, l, pts, gf, ga, gd });
//     });
//     const key = `${div}.table`;
//     const result = await Masses.updateOne({ soccermass }, { $set: { [key]: table } });
//     res.send(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.addGoalAssist = async (req, res, next) => {
//   try {
//     const { soccermass, division } = req.body;
//     const div = division.toLowerCase().replace(/ /g, "");
//     const goalAssist = [];
//     req.body.goalAssist.forEach((i) => {
//       const { name, club, mp, goal, assist } = i;
//       goalAssist.push({ name, club, mp, goal, assist });
//     });
//     const key = `${div}.goalAssist`;
//     const result = await Masses.updateOne({ soccermass }, { $set: { [key]: goalAssist } });
//     res.send(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.addReport = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     const { club } = req.body;
//     const report = [];
//     req.body.report.forEach((i) => {
//       const { detail, content, pic } = i;
//       report.push({ detail, content, pic });
//     });
//     const result = await Clubs.updateOne({ club }, { $set: { report } });
//     res.status(200).send(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.addCalendar = async (req, res, next) => {
//   try {
//     const { soccermass, key } = req.body;
//     const calendar = [];
//     req.body.calendar.forEach((i) => {
//       const { date, home, hg, ag, away, data } = i;
//       calendar.push({ date, home, hg, ag, away, data });
//     });
//     const category = `${key}.calendar`;
//     const result = await Masses.updateOne({ soccermass }, { $set: { [category]: calendar } }, { upsert: true });
//     res.status(200).send(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.updateStat = async (req, res, next) => {
//   try {
//     const Clubs = detail(req);
//     req.body.stat.forEach(async (i) => {
//       const { rating, stadium, location, capacity, fanbase, teamMoral, fearFactor, value, sponsorship, mall, club } = i;
//       await Clubs.updateOne(
//         { club },
//         {
//           $set: {
//             stat: {
//               rating,
//               stadium,
//               location,
//               capacity,
//               fanbase,
//               teamMoral,
//               fearFactor,
//               value,
//               sponsorship,
//               mall,
//               club,
//             },
//           },
//         },
//         { upsert: true }
//       );
//     });
//     res.status(200).send("success");
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err,
//     });
//   }
// };
// exports.addBlogPost = async (req, res, next) => {
//   try {
//     const soccermass = "SoccerMASS";
//     const division = "SoccerMASS";
//     const club = "SoccerMASS";
//     const handle = "SoccerMASS";
//     const category = "blog";
//     await Trends.remove({ category });
//     const date = new Date(Date.now()).toDateString();
//     const blogs = [];
//     await req.body.blogs.forEach((i) => {
//       const { title, body } = i;
//       blogs.push({
//         soccermass,
//         division,
//         club,
//         handle,
//         category,
//         title,
//         body,
//         date,
//       });
//     });
//     const result = await Trends.create(blogs);
//     res.send(result);
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// exports.changeEnergy = async (req, res, next) => {
//   try {
//     const Players = player(req);
//     const team = await Players.find({});
//     const result = await team.forEach(
//       async (i) => await Players.updateOne({ name: i.name }, { $set: { "slot.energy": Math.floor(Math.random() * 99) } })
//     );
//     res.send("successful");
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
// //add random transfers to transfer table in trade/transaction
// exports.randomTransfers = async (req, res, next) => {
//   try {
//     const { transfers, soccermass } = req.body;
//     await Masses.updateOne({ soccermass }, { $addToSet: { transfers } }, { upsert: true });
//     res.send("successful");
//   } catch (err) {
//     return next({
//       status: 400,
//       message: err.message,
//     });
//   }
// };
