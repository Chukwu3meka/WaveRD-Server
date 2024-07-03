import { range, shuffleArray } from "../handlers";

export default function initDivisionLeagueFixtures(clubs: string[], competition: string) {
  if (clubs.length % 2 !== 0) throw { id: 4, sendError: true, message: "Clubs length is not even" };

  const clubsLength = clubs.length;
  const homeFixtures = [];
  const awayFixtures = [];

  for (let i = 0; i < clubsLength - 1; i++) {
    const homeRound = [];
    const awayRound = [];
    const tossCoin = (i + 1) % 2 === 0;

    for (let j = 0; j < clubsLength / 2; j++) {
      if (tossCoin) {
        homeRound.push({ home: clubs[j], away: clubs[clubsLength - 1 - j] });
        awayRound.push({ home: clubs[clubsLength - 1 - j], away: clubs[j] });
      } else {
        homeRound.push({ home: clubs[clubsLength - 1 - j], away: clubs[j] });
        awayRound.push({ home: clubs[j], away: clubs[clubsLength - 1 - j] });
      }
    }

    awayFixtures.push(shuffleArray(awayRound));
    homeFixtures.push(shuffleArray(homeRound));

    const lastClub = clubs.pop(); // <= Rotate the array (keep the first club fixed)
    if (lastClub !== undefined) clubs.splice(1, 0, lastClub);
  }

  const datesArray: string[] = [],
    currentYear = new Date().getFullYear(),
    startDate = new Date(currentYear, 7, 16), //start date
    endDate = new Date(currentYear + 1, 5, 30); //end date

  // Get the first Saturday in the month
  while (startDate.getDay() !== 6) startDate.setDate(startDate.getDate() + 1);

  // Add Saturday/Sunday to dates array
  while (startDate <= endDate) {
    datesArray.push(startDate.toDateString()) && startDate.setDate(startDate.getDate() + 1);
    datesArray.push(startDate.toDateString()) && startDate.setDate(startDate.getDate() + 6);
  }

  const fixtures: {
    hg: Number;
    ag: Number;
    date: Date;
    week: Number;
    home: String;
    away: String;
    group: Number;
    competition: String;
  }[] = [];

  const sundayTime = ["12:00", "14:00", "16:30"],
    saturdayTime = ["12:30", "15:00", "17:30", "20:00"];

  [...shuffleArray(homeFixtures), ...shuffleArray(awayFixtures)].forEach((round, week) => {
    const [firstMatchDate, lastMatchDate] = [datesArray.shift(), datesArray.shift()]; // <= Similitate Saturday/Sunday matches

    if (firstMatchDate === undefined || lastMatchDate === undefined) {
      throw { id: 4, message: "Out of Fixture date range for " + competition };
    }

    const currRound = round
      .map(({ home, away }: { home: string; away: string }, i: number) => {
        const matchDay = clubsLength / 2 / 2,
          selectedDate = new Date(matchDay > i ? firstMatchDate : lastMatchDate),
          selectedMatchTime = selectedDate.getDay() === 0 ? sundayTime : saturdayTime,
          selectedTime = selectedMatchTime[range(0, selectedMatchTime.length - 1)].split(":");

        selectedDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

        return { home, away, week: week + 1, date: selectedDate, hg: 0, ag: 0, group: 0, competition };
      })
      .sort((a: any, b: any) => new Date(a.date).getHours() - new Date(b.date).getHours());

    fixtures.push(...currRound);
  });

  return fixtures;
}
