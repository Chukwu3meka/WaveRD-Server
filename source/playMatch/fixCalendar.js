const { clubDivisions } = require("../library/constants");
const { shuffle, clubInFixture } = require("../library/commonFunc");

// for league matches
module.exports.fixCalendar = async ({ Masses, soccermass }) => {
  const massCalendar = {};
  // loop through each division
  for (const division in clubDivisions) {
    // get clubs in a current division
    const clubs = clubDivisions[division];
    const noOfClubs = clubs.length;
    const calendar1 = [];
    // add empty array to calendar1
    clubs.forEach(() => calendar1.push([]));
    calendar1.pop();
    // fix match for each array in calendar1
    //////    ******************************* //////
    const fixMatch = () => {
      clubs.forEach((currentClub) => {
        // shuffle clubs and assign data to opponents while removing undefined
        let opponents = shuffle(clubs.filter((x) => x !== currentClub)).filter((x) => x !== undefined);
        calendar1.some((matchDay) => {
          // verify that club is not in matchday
          const statusHome = clubInFixture(matchDay, currentClub);
          // loop through opponents and create match data
          opponents.some((opponent) => {
            if (statusHome === false) {
              // verify that opponent is not in matchday
              const statusAway = clubInFixture(matchDay, opponent);
              if (statusAway === false) {
                // add fixture to current matchday
                matchDay.push(`${currentClub}@@@${opponent}`);
                // remove opponent from opponents if added to fixture
                opponents = opponents.filter((x) => x !== opponent);
                return true;
              }
            }
          });
        });
      });
    };
    //////    ******************************* //////

    // verify that all matchday have equal length
    //////    ******************************* //////
    let matchDayIsValid = false;
    const validateMatchDay = () =>
      calendar1.some((matchday) => {
        if (matchday.length === noOfClubs / 2) {
          matchDayIsValid = true;
        } else {
          matchDayIsValid = false;
          return true;
        }
      });

    // while matchday does not have equal length keep generating matches till its equal
    while (!matchDayIsValid) {
      fixMatch();
      validateMatchDay();
    }
    //////    ******************************* //////

    // shuffle calendar to swap home and away club for equal home/away matches
    //////    ******************************* //////
    const calendar2 = [];
    // add second part of season to calendar
    const fullSeason = [...calendar1, ...calendar1];

    // add empty array to calendar2
    for (let i = 1; i <= fullSeason.length; i++) {
      calendar2.push([]);
    }
    fullSeason.forEach((matchDay, index) => {
      matchDay.forEach((fixture, fi) => {
        let rem = index - fi;
        rem = parseInt(rem % 2);
        const home = fixture.split("@@@")[rem === 0 ? 0 : 1];
        const away = fixture.split("@@@")[rem === 0 ? 1 : 0];
        calendar2[index].push([home, away]);
      });
    });
    //////    ******************************* //////

    // generate date for matches
    //////    ******************************* //////
    const datesArray = [];
    const currentYear = new Date().getFullYear();
    // populate the date array
    let date1 = new Date(currentYear, 7, 24); //start date
    let date2 = new Date(currentYear + 1, 5, 20); //end date

    while (date1 < date2) {
      if (date1.getDay() === 0 || date1.getDay() === 6) {
        datesArray.push(date1.toDateString());
      }
      date1.setDate(date1.getDate() + 1);
    }
    //////    ******************************* //////

    // finalize calendar
    //////    ******************************* //////
    const calendar3 = [];
    let matchWeek = 1;
    // loop through each datesarray
    calendar2.forEach((matchDay, index) => {
      // pull first date in dates array
      const date1 = datesArray.shift();
      const date2 = datesArray.shift();
      matchDay.forEach((fixture, fi) => {
        let rem = index - fi;
        rem = parseInt(rem % 2);
        const date = rem === 0 ? date1 : date2;
        const home = fixture[0];
        const hg = null;
        const ag = null;
        const away = fixture[1];
        const data = {};
        const week = matchWeek;
        calendar3.push({ week, date, home, hg, ag, away, data });
      });
      matchWeek = matchWeek + 1;
    });
    //////    ******************************* //////

    // app calendar to database
    //////    ******************************* //////
    const competition = `${division}_League.calendar`;
    massCalendar[competition] = calendar3; // await Masses.updateOne({ soccermass }, { $set: { [competition]: calendar3 } }, { upsert: true });
    //////    ******************************* //////
  }
  console.log(massCalendar);
};
