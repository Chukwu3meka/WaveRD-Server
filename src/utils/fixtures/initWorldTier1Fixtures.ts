import { shuffleArray } from "../handlers";
import { Fixtures } from "../../interface/games.interface";

export default function initWorldTier1Fixtures(clubs: { club: string; league: string }[], competition: string) {
  if (clubs.length !== 32) throw { id: 4, sendError: true, message: competition + " total clubs must be 32" };

  const eligibleClubs = shuffleArray(clubs);

  // Initialize the groups array
  const groups: { club: string; league: string }[][] = Array.from({ length: Math.ceil(eligibleClubs.length / 4) }, () => []);

  // Distribute clubs into groups
  eligibleClubs.forEach((club: { club: string; league: string }) => {
    // Try to find a group where this club can be added without causing a league conflict

    let groupAdded = false;
    for (let group of groups) {
      if (!group.some((c) => c.league === club.league) && group.length < 4) {
        group.push(club);
        groupAdded = true;
        break;
      }
    }
    // If no suitable group was found, add the club to the first group with space
    if (!groupAdded) {
      for (let group of groups) {
        if (group.length < 4) {
          group.push(club);
          break;
        }
      }
    }
  });

  // Check if all groups are valid
  const invalidGroup = groups.find((group) => {
    const leagues = group.map((c) => c.league);
    return new Set(leagues).size !== leagues.length;
  });

  if (invalidGroup) throw { id: 4, sendError: true, message: competition + " has a group with multiple teams from same league" };

  const table = groups.flatMap((group, i) => group.map((club) => ({ club, w: 0, d: 0, l: 0, ga: 0, gd: 0, gf: 0, pts: 0, pld: 0, group: i + 1 })));

  // groups.forEach(
  //   (x) => console.log(x)

  //   //
  // );

  for (const groupClubs of [groups[0]]) {
    // ? Populate groups
    const clubsLength = groupClubs.length;
    const homeFixtures = [];
    const awayFixtures = [];

    for (let i = 0; i < clubsLength - 1; i++) {
      const homeRound = [];
      const awayRound = [];
      const tossCoin = (i + 1) % 2 === 0;

      for (let j = 0; j < clubsLength / 2; j++) {
        const [homeClub, awayClub] = [groupClubs[j].club, groupClubs[clubsLength - 1 - j].club];

        if (tossCoin) {
          homeRound.push({ home: homeClub, away: awayClub });
          awayRound.push({ home: awayClub, away: homeClub });
        } else {
          homeRound.push({ home: awayClub, away: homeClub });
          awayRound.push({ home: homeClub, away: awayClub });
        }
      }

      awayFixtures.push(shuffleArray(awayRound));
      homeFixtures.push(shuffleArray(homeRound));

      const lastClub = groupClubs.pop(); // <= Rotate the array (keep the first club fixed)
      if (lastClub !== undefined) groupClubs.splice(1, 0, lastClub);
    }

    homeFixtures.forEach((x) => console.log(x));
  }

  // for

  // console.log(groups);
  // console.log(table);

  const fixtures: Fixtures[] = [];

  return fixtures;
}
