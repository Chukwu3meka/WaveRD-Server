import { Fixtures } from "../../interface/games.interface";

export default function initWorldSuperCupFixtures(clubs: string[], competition: string) {
  if (clubs.length < 2) throw { id: 4, sendError: true, message: competition + " selected Clubs is insufficient" };

  const currentYear = new Date().getFullYear(),
    superCupDate = new Date(currentYear, 7, 8);

  // Get the first Wednesday in the month
  while (superCupDate.getDay() !== 3) superCupDate.setDate(superCupDate.getDate() + 1);

  const superCupSchedule: Fixtures[] = [
    { home: clubs[1], away: clubs[2], hg: 0, ag: 0, week: 0, competition, group: 0, date: new Date(superCupDate) },
  ];

  return superCupSchedule;
}
