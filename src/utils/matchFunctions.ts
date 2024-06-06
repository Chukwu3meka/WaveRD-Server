// export const sortArr = (arr, sortKey, asc = true) => {
//   let sortedArray = [...arr].filter(Boolean).flat();

//   if (sortedArray?.length) {
//     sortedArray.sort((x, y) => {
//       if (sortKey === "date") {
//         if (new Date(x.date) < new Date(y.date)) return -1;
//         if (new Date(x.date) > new Date(y.date)) return 1;
//       } else if (sortKey === "goal") {
//         if (x.goal > y.goal) return -1;
//         if (x.goal < y.goal) return 1;
//         if (x.mp < y.mp) return -1;
//         if (x.mp > y.mp) return 1;
//         if (x.assist > y.assist) return -1;
//         if (x.assist < y.assist) return 1;
//         if (x.cs > y.cs) return -1;
//         if (x.cs < y.cs) return 1;
//         if (x.red < y.red) return -1;
//         if (x.red > y.red) return 1;
//         if (x.yellow < y.yellow) return -1;
//         if (x.yellow > y.yellow) return 1;
//       } else if (sortKey === "assist") {
//         if (x.assist > y.assist) return -1;
//         if (x.assist < y.assist) return 1;
//         if (x.mp < y.mp) return -1;
//         if (x.mp > y.mp) return 1;
//         if (x.goal > y.goal) return -1;
//         if (x.goal < y.goal) return 1;
//         if (x.cs > y.cs) return -1;
//         if (x.cs < y.cs) return 1;
//         if (x.red < y.red) return -1;
//         if (x.red > y.red) return 1;
//         if (x.yellow < y.yellow) return -1;
//         if (x.yellow > y.yellow) return 1;
//       } else if (sortKey === "cs") {
//         if (x.cs > y.cs) return -1;
//         if (x.cs < y.cs) return 1;
//         if (x.mp < y.mp) return -1;
//         if (x.mp > y.mp) return 1;
//         if (x.goal > y.goal) return -1;
//         if (x.goal < y.goal) return 1;
//         if (x.assist > y.assist) return -1;
//         if (x.assist < y.assist) return 1;
//         if (x.red < y.red) return -1;
//         if (x.red > y.red) return 1;
//         if (x.yellow < y.yellow) return -1;
//         if (x.yellow > y.yellow) return 1;
//       } else if (sortKey === "yellow") {
//         if (x.yellow > y.yellow) return -1;
//         if (x.yellow < y.yellow) return 1;
//         if (x.mp > y.mp) return -1;
//         if (x.mp < y.mp) return 1;
//         if (x.red > y.red) return -1;
//         if (x.red < y.red) return 1;
//         if (x.cs < y.cs) return -1;
//         if (x.cs > y.cs) return 1;
//         if (x.goal < y.goal) return -1;
//         if (x.goal > y.goal) return 1;
//         if (x.assist < y.assist) return -1;
//         if (x.assist > y.assist) return 1;
//       } else if (sortKey === "red") {
//         if (x.red > y.red) return -1;
//         if (x.red < y.red) return 1;
//         if (x.mp > y.mp) return -1;
//         if (x.mp < y.mp) return 1;
//         if (x.yellow > y.yellow) return -1;
//         if (x.yellow < y.yellow) return 1;
//         if (x.cs < y.cs) return -1;
//         if (x.cs > y.cs) return 1;
//         if (x.goal < y.goal) return -1;
//         if (x.goal > y.goal) return 1;
//         if (x.assist < y.assist) return -1;
//         if (x.assist > y.assist) return 1;
//       } else if (sortKey === "table") {
//         if (x.pts > y.pts) return -1;
//         if (x.pts < y.pts) return 1;
//         if (x.pld < y.pld) return -1;
//         if (x.pld > y.pld) return 1;
//         if (x.gf - x.ga > y.gf - y.ga) return -1;
//         if (x.gf - x.ga < y.gf - y.ga) return 1;
//         if (x.gf > y.gf) return -1;
//         if (x.gf < y.gf) return 1;
//         if (x.w > y.w) return -1;
//         if (x.w < y.w) return 1;
//         if (x.ga < y.ga) return -1;
//         if (x.ga > y.ga) return 1;
//         if (x.d > y.d) return -1;
//         if (x.d < y.d) return 1;
//         if (x.l < y.l) return -1;
//         if (x.l > y.l) return 1;
//       } else if (sortKey === "offers") {
//         if (x.fee > y.fee) return -1;
//         if (x.fee < y.fee) return 1;
//         if (x.date > y.date) return asc ? 1 : -1;
//         if (x.date < y.date) return asc ? -1 : 1;
//       } else {
//         sortedArray.sort((x, y) => {
//           if (x[sortKey] > y[sortKey]) return asc ? 1 : -1;
//           if (x[sortKey] < y[sortKey]) return asc ? -1 : 1;
//         });
//       }
//     });
//   }

//   return sortedArray;
// };

// export const scoreGenerator = ({ diff, clubData }) => {
//   const gs = diff >= 5 ? this.range(3, 5) : diff >= 3 ? this.range(2, 4) : diff >= 1 ? this.range(1, 3) : this.range(0, 2);

//   const assistPlayers = this.shuffleArray(
//     clubData.players.flatMap((x) =>
//       x.roles.includes("CF")
//         ? [...new Array(20)].map(() => x.ref)
//         : x.roles.includes("RF")
//         ? [...new Array(40)].map(() => x.ref)
//         : x.roles.includes("LF")
//         ? [...new Array(40)].map(() => x.ref)
//         : x.roles.includes("AM")
//         ? [...new Array(30)].map(() => x.ref)
//         : x.roles.includes("RM")
//         ? [...new Array(20)].map(() => x.ref)
//         : x.roles.includes("LM")
//         ? [...new Array(20)].map(() => x.ref)
//         : x.roles.includes("CM")
//         ? [...new Array(30)].map(() => x.ref)
//         : x.roles.includes("DM")
//         ? [...new Array(10)].map(() => x.ref)
//         : x.roles.includes("LB")
//         ? [...new Array(5)].map(() => x.ref)
//         : x.roles.includes("RB")
//         ? [...new Array(5)].map(() => x.ref)
//         : x.roles.includes("CB")
//         ? [...new Array(5)].map(() => x.ref)
//         : 1
//     )
//   );

//   const goalPlayers = this.shuffleArray(
//     clubData.players
//       .filter((x) => !x.roles.includes("GK"))
//       .flatMap((x) =>
//         x.roles.includes("CF")
//           ? [...new Array(40)].map(() => x.ref)
//           : x.roles.includes("RF")
//           ? [...new Array(20)].map(() => x.ref)
//           : x.roles.includes("LF")
//           ? [...new Array(20)].map(() => x.ref)
//           : x.roles.includes("AM")
//           ? [...new Array(15)].map(() => x.ref)
//           : x.roles.includes("RM")
//           ? [...new Array(10)].map(() => x.ref)
//           : x.roles.includes("LM")
//           ? [...new Array(10)].map(() => x.ref)
//           : x.roles.includes("CM")
//           ? [...new Array(7)].map(() => x.ref)
//           : x.roles.includes("DM")
//           ? [...new Array(5)].map(() => x.ref)
//           : x.roles.includes("LB")
//           ? [...new Array(3)].map(() => x.ref)
//           : x.roles.includes("RB")
//           ? [...new Array(3)].map(() => x.ref)
//           : x.roles.includes("CB")
//           ? [...new Array(1)].map(() => x.ref)
//           : 1
//       )
//   );

//   const bookPlayers = this.shuffleArray(
//     clubData.players.flatMap((x) =>
//       x.roles.includes("CF")
//         ? [...new Array(1)].map(() => x.ref)
//         : x.roles.includes("RF")
//         ? [...new Array(1)].map(() => x.ref)
//         : x.roles.includes("LF")
//         ? [...new Array(1)].map(() => x.ref)
//         : x.roles.includes("AM")
//         ? [...new Array(3)].map(() => x.ref)
//         : x.roles.includes("RM")
//         ? [...new Array(5)].map(() => x.ref)
//         : x.roles.includes("LM")
//         ? [...new Array(5)].map(() => x.ref)
//         : x.roles.includes("CM")
//         ? [...new Array(7)].map(() => x.ref)
//         : x.roles.includes("DM")
//         ? [...new Array(10)].map(() => x.ref)
//         : x.roles.includes("LB")
//         ? [...new Array(15)].map(() => x.ref)
//         : x.roles.includes("RB")
//         ? [...new Array(15)].map(() => x.ref)
//         : x.roles.includes("CB")
//         ? [...new Array(20)].map(() => x.ref)
//         : x.roles.includes("GK")
//         ? [...new Array(3)].map(() => x.ref)
//         : 1
//     )
//   );

//   const assist = Array(this.range(0, gs))
//     .fill()
//     .map(() => assistPlayers[this.range(0, assistPlayers.length - 1)]);

//   const goalEvent = Array(gs)
//     .fill()
//     .map(() => goalPlayers[this.range(0, goalPlayers.length - 1)])
//     .map((goal, index) => ({
//       goal,
//       assist: assist?.length && goal !== assist[index] ? assist[index] || null : null,
//       time: this.range(0, 93),
//     }))
//     .sort((x, y) => x.time - y.time);

//   // ___________ yellow card
//   const yellowBooked = []; // to prevent players receiving card twice
//   const yellowEvents = new Array(this.range(0, diff >= 10 ? 0 : diff >= 5 ? 1 : 2))
//     .fill()
//     .map(() => bookPlayers[this.range(0, 10)])
//     .map((yellow) => {
//       if (!yellowBooked.includes(yellow)) {
//         yellowBooked.push(yellow);
//         return {
//           yellow,
//           time: this.range(0, 93),
//         };
//       }
//     })
//     .filter(Boolean)
//     .sort((x, y) => x.time - y.time);

//   // get all Players in events and their time
//   const eventsPlayers = [
//     ...goalEvent.map((x) => ({ player: x.goal, time: x.time })),
//     ...goalEvent.map((x) => ({ player: x.assist, time: x.time })),
//     ...yellowEvents.map((x) => ({ player: x.yellow, time: x.time })),
//   ]
//     .filter((x) => x.player)
//     .sort((x, y) => y.time - x.time);

//   // substitution
//   const subsInPlayers = clubData.players.filter((x, i) => !x.roles.includes("GK") && i >= 11);
//   const subsOutPlayers = clubData.players.filter((x, i) => !x.roles.includes("GK") && i <= 10);

//   const subbedPlayers = [];
//   const subEvent = new Array(5)
//     .fill()
//     .map(() => {
//       const subInIndex = this.range(0, subsInPlayers.length - 1);
//       const subOutIndex = this.range(0, subsOutPlayers.length - 1);
//       const subIn = subsInPlayers[subInIndex]?.ref;
//       const subOut = subsOutPlayers[subOutIndex]?.ref;

//       if (subbedPlayers.includes(subIn) || subbedPlayers.includes(subOut)) return null;

//       subbedPlayers.push(subIn, subOut);
//       subsInPlayers.slice(subInIndex, 1);
//       subsOutPlayers.slice(subOutIndex, 1);

//       const eventsWithSubs = eventsPlayers.filter((x) => [subIn, subOut].includes(x.player));

//       if (eventsWithSubs.length) {
//         return { subIn, subOut, time: this.range(eventsWithSubs[0].time < 70 ? 70 : eventsWithSubs[0].time, 93) };
//       } else {
//         return { subIn, subOut, time: this.range(40, 93) };
//       }
//     })
//     .filter(Boolean);

//   const matchEvent = { goal: goalEvent, yellow: yellowEvents, sub: subEvent };

//   return { gs, matchEvent };
// };

// export const generateMatches = async (clubs) => {
//   let uniqueMatches = [];
//   let unusedClubs = [...clubs];

//   // create unique set of matches
//   for (const club of clubs) {
//     for (const opp of unusedClubs.filter((x) => x !== club)) {
//       // to prevent one team from always being the home team week in week out
//       uniqueMatches.push(unusedClubs.filter((x) => x !== club).indexOf(opp) % 2 ? `${club}@@@${opp}` : `${opp}@@@${club}`);

//       //   uniqueMatches.push(`${club}@@@${opp}`);
//       unusedClubs = unusedClubs.filter((x) => x !== club);
//     }
//   }

//   const oneLegSchedule = [...Array(clubs.length - 1).keys()].map((x) => []);

//   const matchDayChecker = (matchDay, fixture) => {
//     if (matchDay.length === 0) return true;

//     const [club, opp] = fixture.split("@@@");
//     const clubsInMatchDay = matchDay.flatMap((fixture) => fixture.split("@@@"));

//     if (clubsInMatchDay.includes(opp) || clubsInMatchDay.includes(club)) return false;

//     return true;
//   };

//   for (const matchDay of oneLegSchedule) {
//     for (const fixture of uniqueMatches) {
//       if (matchDayChecker(matchDay, fixture)) {
//         matchDay.push(fixture);
//         uniqueMatches = uniqueMatches.filter((x) => x !== fixture);
//       }
//     }
//   }

//   const schedule = [...oneLegSchedule];

//   // generateAwayFixtures
//   for (const fixture of oneLegSchedule) {
//     schedule.push(
//       fixture.map((x) => {
//         const [home, away] = x.split("@@@");
//         return `${away}@@@${home}`;
//       })
//     );
//   }

//   return schedule;
// };

// export const acceptOffer = async ({ from, to, fee, player, ackMsg, mass, Player, Mass, Club }) => {
//   // fromCLubData
//   const fromClubData = await Club(mass).findOne({ ref: from });
//   const toClubData = to === "club000000" ? "premium" : await Club(mass).findOne({ ref: to });
//   if (!fromClubData || !toClubData) throw "Illegal Transaction";

//   if (fee > fromClubData.budget) throw "Insufficient Funds";

//   if (fromClubData.tactics.squad.length >= process.env.MAX_SQUAD) throw "Max Squad limit reached";

//   if (toClubData !== "premium" && toClubData.tactics.squad.length <= process.env.MIN_SQUAD) throw "Min Squad limit reached";

//   // ______________________________________ update mass data
//   await Mass.updateOne(
//     { ref: mass },
//     {
//       $push: {
//         news: {
//           $each: [
//             {
//               content: ackMsg,
//               image: `/player/${player}.webp`,
//               title: `OFFICIAL: @(club,${from},title) Transfer NEWS`,
//             },
//           ],
//           $slice: 15,
//           $position: 0,
//         },
//         transfer: {
//           $each: [{ to: from, fee, from: to, player }],
//           $slice: 50,
//           $position: 0,
//         },
//       },
//       $pull: { offer: { player } },
//     }
//   );

//   // _______________________________________ update club data
//   const {
//     history: {
//       transfer: { priciestArrival, cheapestArrival },
//     },
//   } = fromClubData;

//   await Club(mass).updateOne(
//     { ref: from },
//     {
//       $pull: {
//         transferTarget: player,
//       },
//       $addToSet: {
//         "tactics.squad": player,
//       },
//       $inc: { "nominalAccount.arrival": fee, budget: -fee },
//       $set: {
//         "history.transfer.priciestArrival": {
//           club: fee > Number(priciestArrival.fee) ? to : priciestArrival.club,
//           fee: fee > Number(priciestArrival.fee) ? fee : priciestArrival.fee,
//           player: fee > Number(priciestArrival.fee) ? player : priciestArrival.player,
//           date: fee > Number(priciestArrival.fee) ? new Date() : priciestArrival.date,
//         },
//         "history.transfer.cheapestArrival": {
//           club: cheapestArrival.fee === null || fee < cheapestArrival.fee ? to : cheapestArrival.club,
//           fee: cheapestArrival.fee === null || fee < cheapestArrival.fee ? fee : cheapestArrival.fee,
//           player: cheapestArrival.fee === null || fee < cheapestArrival.fee ? player : cheapestArrival.player,
//           date: cheapestArrival.fee === null || fee < cheapestArrival.fee ? new Date() : cheapestArrival.date,
//         },
//       },
//     }
//   );

//   if (toClubData !== "premium") {
//     const {
//       history: {
//         transfer: { priciestDeparture, cheapestDeparture },
//       },
//     } = toClubData;

//     await Club(mass).updateOne(
//       { ref: to },
//       {
//         $pull: {
//           "tactics.squad": player,
//         },
//         $inc: { "nominalAccount.departure": fee },
//         $set: {
//           "history.transfer.priciestDeparture": {
//             club: fee > Number(priciestDeparture.fee) ? to : priciestDeparture.club,
//             fee: fee > Number(priciestDeparture.fee) ? fee : priciestDeparture.fee,
//             player: fee > Number(priciestDeparture.fee) ? player : priciestDeparture.player,
//             date: fee > Number(priciestDeparture.fee) ? new Date() : priciestDeparture.date,
//           },
//           "history.transfer.cheapestDeparture": {
//             club: cheapestDeparture.fee === null || fee < cheapestDeparture.fee ? to : cheapestDeparture.club,
//             fee: cheapestDeparture.fee === null || fee < cheapestDeparture.fee ? fee : cheapestDeparture.fee,
//             player: cheapestDeparture.fee === null || fee < cheapestDeparture.fee ? player : cheapestDeparture.player,
//             date: cheapestDeparture.fee === null || fee < cheapestDeparture.fee ? new Date() : cheapestDeparture.date,
//           },
//         },
//       }
//     );
//   }

//   // _______________________________________ update player data
//   await Player(mass).updateOne(
//     { ref: player },
//     {
//       $set: {
//         club: from,
//         "transfer.offers": [],
//         "transfer.locked": true,
//         "transfer.listed": false,
//       },
//     }
//   );
// };

// export const varReplacer = (str = "") => {
//   const regexp = new RegExp(/@\((.*?)\)/, "g");
//   const matches = str.matchAll(regexp);

//   for (const x of matches) {
//     const [store, value, property] = x[0].match(/@\((.*?)\)/)[1].split(",");

//     switch (store) {
//       case "club":
//         // console.log(matches);
//         str = str.split(x[0]).join(clubStore(value)[property]);
//         break;
//       case "player":
//         str = str.split(x[0]).join(playerStore(value)[property]);
//         break;
//       default:
//         str = str.split(x[0]).join(massStore(value));
//         break;
//     }
//   }

//   return str;
// };
