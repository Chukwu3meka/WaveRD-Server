import { range, shuffleArray } from "../handlers";

export default function genCupFixtures(tempClubs: string[]) {
  const groupSize = 4;

  if (tempClubs.length % 4 !== 0) throw { sendError: true, message: "Clubs length is not even" };

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

  const cupGroups = [];
  const clubs = shuffleArray(tempClubs);

  for (let i = 0; i < clubs.length; i += groupSize) {
    const chunk = clubs.slice(i, i + groupSize);
    cupGroups.push(chunk);
  }

  for (const [currClubsIndex, clubs] of Object.entries(cupGroups)) {
    if (clubs.length % 4 !== 0) throw { sendError: true, message: "Clubs length is not even" };

    const homeFixtures = [],
      group = +currClubsIndex + 1,
      [competition, clubsLength] = ["Cup", clubs.length];

    for (let i = 0; i < clubsLength - 1; i++) {
      const homeRound = [];
      const tossCoin = (i + 1) % 2 === 0;

      for (let j = 0; j < clubsLength / 2; j++) {
        if (tossCoin) {
          homeRound.push({ home: clubs[j], away: clubs[clubsLength - 1 - j] });
        } else {
          homeRound.push({ home: clubs[clubsLength - 1 - j], away: clubs[j] });
        }
      }

      homeFixtures.push(shuffleArray(homeRound));

      const lastClub = clubs.pop(); // <= Rotate the array (keep the first club fixed)
      if (lastClub !== undefined) clubs.splice(1, 0, lastClub);
    }

    const datesArray: string[] = [],
      currentYear = new Date().getFullYear(),
      startDate = new Date(currentYear, 7, 16), //start date
      endDate = new Date(currentYear + 1, 12, 24); //end date

    // Get the first Tuesday in the month
    while (startDate.getDay() !== 2) startDate.setDate(startDate.getDate() + 1);

    // Add Saturday/Sunday to dates array
    while (startDate <= endDate) {
      datesArray.push(startDate.toDateString()) && startDate.setDate(startDate.getDate() + 14);
    }

    const cupTime = ["12:00", "12:30", "15:00", "17:30", "18:00", "19:45"];

    const shuffledHomeFixtures = shuffleArray(homeFixtures);
    const allFixtures = [...shuffledHomeFixtures, ...[...shuffledHomeFixtures].reverse()];

    allFixtures.forEach((round, i: number) => {
      const [firstMatchDate, lastMatchDate] = [datesArray.shift(), datesArray.shift()]; // <= Similitate Saturday/Sunday matches

      if (firstMatchDate === undefined || lastMatchDate === undefined) {
        throw { message: "Out of Fixture date range for " + competition, id: 4 };
      }

      const currRound = round
        .map(({ home, away }: { home: string; away: string }) => {
          const matchDay = clubsLength / 2 / 2,
            selectedTime = cupTime[range(0, cupTime.length - 1)].split(":"),
            selectedDate = new Date(matchDay > i ? firstMatchDate : lastMatchDate);

          selectedDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

          return { home, away, week: i + 1, date: selectedDate, hg: 0, ag: 0, group, competition };
        })
        .sort((a: any, b: any) => new Date(a.date).getHours() - new Date(b.date).getHours());

      fixtures.push(...currRound);
    });
  }

  return fixtures;
}
