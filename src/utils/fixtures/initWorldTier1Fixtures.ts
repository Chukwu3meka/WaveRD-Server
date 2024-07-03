import { Fixtures } from "../../interface/games.interface";
import { range, shuffleArray } from "../handlers";

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

  // ? Populate groups

  const table = groups.flatMap((group, i) => {
    group.map((club) => ({ club, w: 0, d: 0, l: 0, ga: 0, gd: 0, gf: 0, pts: 0, pld: 0, group: i + 1 }));
  });
  // for

  // console.log(groups);
  console.log(table);

  const fixtures: Fixtures[] = [];

  return fixtures;
}
