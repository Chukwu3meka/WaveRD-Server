import { range, shuffleArray } from "../handlers";
import { Fixtures } from "../../interface/games.interface";

export default function initDivisionCupFixtures(tempClubs: string[], competition: string) {
  if (tempClubs.length < 32) throw { id: 4, sendError: true, message: "Clubs selected for Division Cup is insufficient" };

  const fixtures: Fixtures[] = [],
    clubs = shuffleArray(tempClubs.slice(0, 32));

  const datesArray: string[] = [],
    currentYear = new Date().getFullYear(),
    startDate = new Date(currentYear, 11, 8), //start date
    endDate = new Date(currentYear + 1, 5, 30), //end date
    cupTime = ["12:00", "12:30", "15:00", "17:30", "18:00", "19:45"];

  // Get the first Thursday in the month
  while (startDate.getDay() !== 4) startDate.setDate(startDate.getDate() + 1);

  // Add Saturday/Sunday to dates array
  while (startDate <= endDate) {
    datesArray.push(startDate.toDateString()) && startDate.setDate(startDate.getDate() + 7);
  }

  let stage = 32;
  const stageFixtures: { [key: string]: Fixtures[] } = {};

  while (stage >= 2) {
    const fixtures: Fixtures[] = [];
    let [firstMatchDate, midMatchDate, lastMatchDate] = ["", "", ""];

    if (stage > 8) {
      //  ? Similitate Saturday/Sunday matches
      const [tempFirstMatchDate, tempMidMatchDate, tempLastMatchDate] = [datesArray.shift(), datesArray.shift(), datesArray.shift()];

      if (tempFirstMatchDate === undefined || tempMidMatchDate === undefined || tempLastMatchDate === undefined) {
        throw { id: 4, message: "Out of Fixture date range for " + competition + " in multi date" };
      }

      [firstMatchDate, midMatchDate, lastMatchDate] = [tempFirstMatchDate, tempMidMatchDate, tempLastMatchDate];

      if (firstMatchDate === "" || midMatchDate === "" || lastMatchDate === "") throw { id: 4, message: "Invalid Fixture date for " + competition };

      datesArray.shift(); // skip one week to create interval before next knockout stage
      datesArray.shift(); // skip one week to create interval before next knockout stage
      datesArray.shift(); // skip one week to create interval before next knockout stage
    } else if ([4, 8].includes(stage)) {
      //  ? Similitate Saturday/Sunday matches
      const [tempFirstMatchDate, tempLastMatchDate] = [datesArray.shift(), datesArray.shift()];

      if (tempFirstMatchDate === undefined || tempLastMatchDate === undefined) {
        throw { id: 4, message: "Out of Fixture date range for " + competition + " in multi date" };
      }

      [firstMatchDate, lastMatchDate] = [tempFirstMatchDate, tempLastMatchDate];

      if (firstMatchDate === "" || lastMatchDate === "") throw { id: 4, message: "Invalid Fixture date for " + competition };
    } else {
      const date = datesArray.shift();
      if (date === undefined) throw { id: 4, message: "Out of Fixture date range for " + competition + " in single date" };

      firstMatchDate = date;
    }

    for (let index = 0; index < stage / 2; index++) {
      const tripleMatchDay = (index + 1) % 3,
        doubleMatchDay = (index + 1) % 2 === 0,
        selectedTime = cupTime[range(0, cupTime.length - 1)].split(":"),
        selectedDate =
          stage === 2
            ? new Date(firstMatchDate)
            : [4, 8].includes(stage)
            ? new Date(doubleMatchDay ? firstMatchDate : lastMatchDate)
            : new Date(tripleMatchDay === 0 ? lastMatchDate : tripleMatchDay === 1 ? midMatchDate : firstMatchDate);

      selectedDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

      fixtures.push({
        hg: 0,
        ag: 0,
        week: 0,
        competition,
        group: stage,
        date: selectedDate,
        home: `round${stage}-club${index + 1}`,
        away: `round${stage}-club${stage - index}`,
      });
    }

    stageFixtures[stage] = fixtures;
    stage /= 2;
  }

  for (const stage in stageFixtures) {
    if (stage === "32") {
      fixtures.push(
        ...stageFixtures[stage].map((fixture) => ({
          ...fixture,
          home: clubs[Number(fixture.home.replace("round32-club", "")) - 1],
          away: clubs[Number(fixture.away.replace("round32-club", "")) - 1],
        }))
      );
    } else {
      fixtures.push(...stageFixtures[stage]);
    }
  }

  return fixtures.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
