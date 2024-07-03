import { Fixtures } from "../../interface/games.interface";

export default function initDivisionSuperCupFixtures(clubs: string[], competition: string) {
  if (clubs.length < 4) throw { id: 4, sendError: true, message: competition + " selected Clubs is insufficient" };

  const datesArray: string[] = [],
    currentYear = new Date().getFullYear(),
    endDate = new Date(currentYear + 1, 0, 21), //end date
    startDate = new Date(currentYear + 1, 0, 1); //start date

  // Get the first Thursday in the month  and // Add next Thursday to dates array
  while (startDate.getDay() !== 4) startDate.setDate(startDate.getDate() + 1);
  while (startDate <= endDate) datesArray.push(startDate.toDateString()) && startDate.setDate(startDate.getDate() + 7);

  const firstLegDate = new Date(datesArray[0]);
  const secondLegDate = new Date(datesArray[1]);
  const finalMatchDate = new Date(datesArray[2]);

  const superCupSchedule: Fixtures[] = [
    { home: clubs[1], away: clubs[4], hg: 0, ag: 0, week: 1, competition, group: 0, date: new Date(firstLegDate.setHours(12, 30)) },
    { home: clubs[2], away: clubs[3], hg: 0, ag: 0, week: 1, competition, group: 0, date: new Date(firstLegDate.setHours(15, 30)) },
    { home: clubs[4], away: clubs[1], hg: 0, ag: 0, week: 2, competition, group: 0, date: new Date(secondLegDate.setHours(17, 45)) },
    { home: clubs[3], away: clubs[2], hg: 0, ag: 0, week: 2, competition, group: 0, date: new Date(secondLegDate.setHours(19, 45)) },
    { home: "winner1", away: "winner2", hg: 0, ag: 0, week: 3, competition, group: 0, date: new Date(finalMatchDate.setHours(21, 0)) },
  ];

  return superCupSchedule;
}
