const { massList, roleList, formationList, assistProbabilityList, goalProbabilityList } = require("../source/constants");

// catch err in return
module.exports.catchError = ({ res, err, status = 400, message = "Internal Server Error" }) => {
  if (process.env.NODE_ENV !== "production") console.log(`${res.req.originalUrl}: ${err}`);
  res.status(status).json(message);
};

module.exports.validateRequestBody = (body, arr) => {
  const validate = require("./validator").validate;
  const newBody = {};

  // validate all required param
  for (const key of arr) {
    if (
      validate(
        key === "password"
          ? "password"
          : key === "handle"
          ? "handle"
          : key === "email"
          ? "email"
          : ["serverStamp", "fee"].includes(key)
          ? "number"
          : ["list", "target"].includes(key)
          ? "boolean"
          : ["squad", "roles"].includes(key)
          ? "textArray"
          : ["age", "value", "rating"].includes(key)
          ? "numberArray"
          : ["dob", "date"].includes(key)
          ? "date"
          : "text",
        body[key]
      ) === undefined
    ) {
      throw `${key} parameter not validataed`;
    }

    newBody[key] = ["serverStamp", "fee"].includes(key) ? Number(body[key]) : body[key];
  }

  return { ...newBody };
};

// get random value between two numbers
module.exports.range = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// make values in an array unique
module.exports.uniqueArray = (arr) => arr.filter((value, index, self) => self.indexOf(value) === index);

//to shuffle array
module.exports.shuffleArray = (arr = []) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 3));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// get players and club ref
module.exports.getRef = (refType, ref) => {
  switch (refType) {
    case "club":
      return `club${`${ref}`.padStart(6, "0")}`;
    case "player":
      return `player${`${ref}`.padStart(9, "0")}`;
    case "sm":
      return `sm${`${ref}`.padStart(9, "0")}`;
    default:
      return undefined;
  }
};

// display portions of mail
module.exports.asterickMail = (mail) => {
  const emailServerDomain = mail.split("@")[1],
    emailUserName = mail.split("@")[0].substr(0, 3);

  return `${emailUserName}***${emailServerDomain}`;
};

module.exports.obfuscate = (s, c) => {
  s = `${s}`;
  c = c || 0x7f;
  let r = "";
  for (i in s) {
    valh = (s.charCodeAt(i) ^ c).toString(16);
    if (valh.length == 1) valh = "0" + valh;
    r += valh;
  }
  return r;
};

module.exports.sessionGenerator = (id, length = 36) => {
  const { v4 } = require("uuid");

  let session = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    session += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return id ? `${session}-${id}-${v4()}` : `${session}-${v4()}`;
};

module.exports.arrayToChunks = (arr, size) => {
  const arrChunks = [],
    newArr = Array.from(arr);

  while (newArr.length) {
    arrChunks.push(newArr.splice(0, size));
  }

  return arrChunks;
};

module.exports.numToText = (no) => {
  switch (no) {
    case 1:
      return "One";
    case 2:
      return "Two";
    case 3:
      return "Three";
    case 4:
      return "Four";
    case 5:
      return "Five";
    case 6:
      return "Six";
    case 7:
      return "Seven";
    case 8:
      return "Eight";
    default:
      return null;
  }
};

module.exports.sortArr = (arr, sortKey, asc = true) => {
  let sortedArray = [...arr].filter(Boolean).flat();

  if (sortedArray?.length) {
    sortedArray.sort((x, y) => {
      if (sortKey === "date") {
        if (new Date(x.date) < new Date(y.date)) return -1;
        if (new Date(x.date) > new Date(y.date)) return 1;
      } else if (sortKey === "goal") {
        if (x.goal > y.goal) return -1;
        if (x.goal < y.goal) return 1;
        if (x.mp < y.mp) return -1;
        if (x.mp > y.mp) return 1;
        if (x.assist > y.assist) return -1;
        if (x.assist < y.assist) return 1;
        if (x.cs > y.cs) return -1;
        if (x.cs < y.cs) return 1;
        if (x.red < y.red) return -1;
        if (x.red > y.red) return 1;
        if (x.yellow < y.yellow) return -1;
        if (x.yellow > y.yellow) return 1;
      } else if (sortKey === "assist") {
        if (x.assist > y.assist) return -1;
        if (x.assist < y.assist) return 1;
        if (x.mp < y.mp) return -1;
        if (x.mp > y.mp) return 1;
        if (x.goal > y.goal) return -1;
        if (x.goal < y.goal) return 1;
        if (x.cs > y.cs) return -1;
        if (x.cs < y.cs) return 1;
        if (x.red < y.red) return -1;
        if (x.red > y.red) return 1;
        if (x.yellow < y.yellow) return -1;
        if (x.yellow > y.yellow) return 1;
      } else if (sortKey === "cs") {
        if (x.cs > y.cs) return -1;
        if (x.cs < y.cs) return 1;
        if (x.mp < y.mp) return -1;
        if (x.mp > y.mp) return 1;
        if (x.goal > y.goal) return -1;
        if (x.goal < y.goal) return 1;
        if (x.assist > y.assist) return -1;
        if (x.assist < y.assist) return 1;
        if (x.red < y.red) return -1;
        if (x.red > y.red) return 1;
        if (x.yellow < y.yellow) return -1;
        if (x.yellow > y.yellow) return 1;
      } else if (sortKey === "yellow") {
        if (x.yellow > y.yellow) return -1;
        if (x.yellow < y.yellow) return 1;
        if (x.mp > y.mp) return -1;
        if (x.mp < y.mp) return 1;
        if (x.red > y.red) return -1;
        if (x.red < y.red) return 1;
        if (x.cs < y.cs) return -1;
        if (x.cs > y.cs) return 1;
        if (x.goal < y.goal) return -1;
        if (x.goal > y.goal) return 1;
        if (x.assist < y.assist) return -1;
        if (x.assist > y.assist) return 1;
      } else if (sortKey === "red") {
        if (x.red > y.red) return -1;
        if (x.red < y.red) return 1;
        if (x.mp > y.mp) return -1;
        if (x.mp < y.mp) return 1;
        if (x.yellow > y.yellow) return -1;
        if (x.yellow < y.yellow) return 1;
        if (x.cs < y.cs) return -1;
        if (x.cs > y.cs) return 1;
        if (x.goal < y.goal) return -1;
        if (x.goal > y.goal) return 1;
        if (x.assist < y.assist) return -1;
        if (x.assist > y.assist) return 1;
      } else if (sortKey === "table") {
        if (x.pts > y.pts) return -1;
        if (x.pts < y.pts) return 1;
        if (x.pld < y.pld) return -1;
        if (x.pld > y.pld) return 1;
        if (x.gf - x.ga > y.gf - y.ga) return -1;
        if (x.gf - x.ga < y.gf - y.ga) return 1;
        if (x.gf > y.gf) return -1;
        if (x.gf < y.gf) return 1;
        if (x.w > y.w) return -1;
        if (x.w < y.w) return 1;
        if (x.ga < y.ga) return -1;
        if (x.ga > y.ga) return 1;
        if (x.d > y.d) return -1;
        if (x.d < y.d) return 1;
        if (x.l < y.l) return -1;
        if (x.l > y.l) return 1;
      } else {
        sortedArray.sort((x, y) => {
          if (x[sortKey] > y[sortKey]) return asc ? 1 : -1;
          if (x[sortKey] < y[sortKey]) return asc ? -1 : 1;
        });
      }
    });
  }

  return sortedArray;
};

module.exports.scoreGenerator = ({ diff, clubData }) => {
  const gs =
    diff >= 20
      ? this.range(4, 7)
      : diff >= 15
      ? this.range(3, 5)
      : diff >= 10
      ? this.range(2, 3)
      : diff >= 5
      ? this.range(1, 2)
      : diff >= 3
      ? this.range(0, 1)
      : this.range(0, 2);

  const goalPlayers = this.shuffleArray(
    clubData.players
      .filter((x) => !x.roles.includes("GK"))
      .flatMap((x) =>
        x.roles.includes("CF")
          ? [...new Array(40)].map(() => x.ref)
          : x.roles.includes("RF")
          ? [...new Array(20)].map(() => x.ref)
          : x.roles.includes("LF")
          ? [...new Array(20)].map(() => x.ref)
          : x.roles.includes("AM")
          ? [...new Array(15)].map(() => x.ref)
          : x.roles.includes("RM")
          ? [...new Array(10)].map(() => x.ref)
          : x.roles.includes("LM")
          ? [...new Array(10)].map(() => x.ref)
          : x.roles.includes("CM")
          ? [...new Array(7)].map(() => x.ref)
          : x.roles.includes("DM")
          ? [...new Array(5)].map(() => x.ref)
          : x.roles.includes("LB")
          ? [...new Array(3)].map(() => x.ref)
          : x.roles.includes("RB")
          ? [...new Array(3)].map(() => x.ref)
          : x.roles.includes("CB")
          ? [...new Array(1)].map(() => x.ref)
          : 1
      )
  );

  const bookPlayers = this.shuffleArray(
    clubData.players.flatMap((x) =>
      x.roles.includes("CF")
        ? [...new Array(1)].map(() => x.ref)
        : x.roles.includes("RF")
        ? [...new Array(1)].map(() => x.ref)
        : x.roles.includes("LF")
        ? [...new Array(1)].map(() => x.ref)
        : x.roles.includes("AM")
        ? [...new Array(3)].map(() => x.ref)
        : x.roles.includes("RM")
        ? [...new Array(5)].map(() => x.ref)
        : x.roles.includes("LM")
        ? [...new Array(5)].map(() => x.ref)
        : x.roles.includes("CM")
        ? [...new Array(7)].map(() => x.ref)
        : x.roles.includes("DM")
        ? [...new Array(10)].map(() => x.ref)
        : x.roles.includes("LB")
        ? [...new Array(15)].map(() => x.ref)
        : x.roles.includes("RB")
        ? [...new Array(15)].map(() => x.ref)
        : x.roles.includes("CB")
        ? [...new Array(20)].map(() => x.ref)
        : x.roles.includes("GK")
        ? [...new Array(3)].map(() => x.ref)
        : 1
    )
  );

  const assist = [...new Array(this.range(0, gs))].map(() => goalPlayers[this.range(0, goalPlayers.length - 1)]);

  const goalEvent = [...new Array(gs)]
    .map(() => goalPlayers[this.range(0, goalPlayers.length - 1)])
    .map((goal, index) => ({
      goal,
      assist: assist?.length && goal !== assist[index] ? assist[index] || null : null,
      time: this.range(0, 93),
    }))
    .sort((x, y) => x.time - y.time);

  // ___________ yellow card
  const yellowBooked = []; // to prevent players receiving card twice
  const yellowEvents = new Array(this.range(0, diff >= 10 ? 0 : diff >= 5 ? 1 : diff >= 0 ? 2 : 3))
    .fill()
    .map(() => bookPlayers[this.range(0, 10)])
    .map((yellow) => {
      if (!yellowBooked.includes(yellow)) {
        yellowBooked.push(yellow);
        return {
          yellow,
          time: this.range(0, 93),
        };
      }
    })
    .filter(Boolean)
    .sort((x, y) => x.time - y.time);

  // get all Players in events and their time
  const eventsPlayers = [
    ...goalEvent.map((x) => ({ player: x.goal, time: x.time })),
    ...goalEvent.map((x) => ({ player: x.assist, time: x.time })),
    ...yellowEvents.map((x) => ({ player: x.yellow, time: x.time })),
  ]
    .filter((x) => x.player)
    .sort((x, y) => y.time - x.time);

  // substitution
  const subsInPlayers = clubData.players.filter((x, i) => !x.roles.includes("GK") && i >= 11);
  const subsOutPlayers = clubData.players.filter((x, i) => !x.roles.includes("GK") && i <= 10);

  const subbedPlayers = [];
  const subEvent = new Array(5)
    .fill()
    .map(() => {
      const subInIndex = this.range(0, subsInPlayers.length - 1);
      const subOutIndex = this.range(0, subsOutPlayers.length - 1);
      const subIn = subsInPlayers[subInIndex]?.ref;
      const subOut = subsOutPlayers[subOutIndex]?.ref;

      if (subbedPlayers.includes(subIn) || subbedPlayers.includes(subOut)) return null;

      subbedPlayers.push(subIn, subOut);
      subsInPlayers.slice(subInIndex, 1);
      subsOutPlayers.slice(subOutIndex, 1);

      const eventsWithSubs = eventsPlayers.filter((x) => [subIn, subOut].includes(x.player));

      if (eventsWithSubs.length) {
        return { subIn, subOut, time: this.range(eventsWithSubs[0].time < 70 ? 70 : eventsWithSubs[0].time, 93) };
      } else {
        return { subIn, subOut, time: this.range(40, 93) };
      }
    })
    .filter(Boolean);

  const matchEvent = { goal: goalEvent, yellow: yellowEvents, sub: subEvent };

  return { gs, matchEvent };
};

module.exports.generateMatches = async (clubs) => {
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
