import { DIVISIONS } from "./constants";
import { Calendar, Table } from "../interface/games.interface";
import { createSubarrays, range, shuffleArray } from "./handlers";
import { GAMES_CALENDAR, GAMES_CLUB, GAMES_TABLE } from "../models/games";
import { styleText } from "util";
import { log } from "console";

const maxNoCupClubs = 32;

export default async function fixturesGenerator(worldRef: string, existingWorld: boolean) {
  if (!worldRef) throw { sendError: true, message: "Game World is undefined", id: 3 };

  const gameWorldClubs = await GAMES_CLUB.find({ world: worldRef });
  if (!gameWorldClubs.length) throw { id: 4, sendError: true, message: "Game world clubs not found" };

  const leagues: string[] = [];
  const countries: string[] = [];
  const leagueClubs: { [league: string]: string[] } = {};

  console.log(styleText("cyan", "Mapping through Game World Clubs"));
  for (const clubData of gameWorldClubs) {
    const { league, club } = clubData;

    const leagueSplit = league.split("_"),
      country = leagueSplit.splice(0, leagueSplit.length - 1).join("_");

    // add current league to list of leagues
    if (!leagues.includes(league)) leagues.push(league);

    // populate league clubs array
    if (leagueClubs[league]) leagueClubs[league].push(club);
    if (!leagueClubs[league]) leagueClubs[league] = [club];

    // add country to list of countries
    if (!countries.includes(country)) countries.push(country);
  }

  const calendar: Calendar[] = [],
    table: Table[] = [];

  console.log(styleText("cyan", "Mapping through Leagues"));
  for (const competition of leagues) {
    const clubs = leagueClubs[competition];
    if (!clubs) throw { id: 4, sendError: true, message: "Clubs is indefined" };
    if (clubs.length % 2 !== 0) throw { id: 4, sendError: true, message: "Clubs length is not even" };

    // ? Generate League Calendar and Table

    console.log(styleText("cyan", `Generating ${competition} League Table`));
    const leagueTable = genComptTable({ clubs, group: null, competition: competition + "_league", world: worldRef });
    console.log(styleText("cyan", `Generating ${competition} League Calendar`));
    const leagueCalendar = genLeagueFixtures({ clubs, group: null, competition: competition + "_league", world: worldRef });

    console.log(styleText("cyan", `Pushing to ${competition} temp table`));
    table.push(...leagueTable);
    console.log(styleText("cyan", `Pushing to ${competition} temp calendar`));
    calendar.push(...leagueCalendar);
  }

  console.log(styleText("cyan", `Mapping through countries`));
  for (const country of countries) {
    console.log(styleText("cyan", `Generating ${country} Cup Calendar`));
    const cupCalendar = await genCupFixtures({ country, world: worldRef, existingWorld, table }); // <= Generate Cup Calendar
    console.log(styleText("cyan", `Generating ${country} Shield Calendar`));
    const shieldCalendar = await genShieldFixtures({ group: null, country, world: worldRef, existingWorld, table }); // <= Generate Shield Calendar

    // console.log({ shieldCalendar });
    console.log(styleText("cyan", `Genetaaing tier one fixtures`));
    const worldTier1fixtures = await genWorldTierFixtures({ tier: 1, world: worldRef, existingWorld, table, countries });
    const worldTier2fixtures = await genWorldTierFixtures({ tier: 2, world: worldRef, existingWorld, table, countries });

    // gameWorldClubs

    // console.log({ topLaegueClubs });
    calendar.push(...cupCalendar, ...shieldCalendar);
  }

  console.log(" ");
  // await GAMES_TABLE.insertMany(table);
  // await GAMES_CALENDAR.insertMany(calendar);
}

const matchTimes = {
  league: [
    ["12:30", "15:00", "17:30", "20:00"],
    ["12:00", "14:00", "16:30"],
  ],
  tier: ["21:00", "19:45"],
  shield: ["12:30", "15:30", "17:45", "19:45", "21:0"],
  cup: ["12:00", "12:30", "15:00", "17:30", "18:00", "19:45"],
};

function getMatchDates(competition: string): string[] {
  const datesArray = [];

  const currentYear = new Date().getFullYear(),
    [startYear, startMonth, startDay, endYear, endMonth, endDay, firstMatchDay, subsequentMatchDays] = competition.endsWith("_league")
      ? [currentYear, 7, 16, currentYear + 1, 5, 30, 6, [1, 6]]
      : competition.endsWith("_cup")
      ? [currentYear, maxNoCupClubs > 32 ? 9 : 11, 8, currentYear + 1, 5, 30, 4, [7]]
      : competition.endsWith("_shield")
      ? [currentYear, 0, 1, currentYear, 0, 21, 4, [7]]
      : competition.endsWith("world_tier_1_group")
      ? [currentYear, 8, 15, currentYear, 11, 7, 2, [1, 6, 1, 21, 1, 6, 1, 6, 1, 6, 1, 6]]
      : competition.endsWith("world_tier_2_group")
      ? [currentYear, 8, 15, currentYear, 11, 7, 4, [7, 21, 7, 7, 7, 7]]
      : [null, null, null, null, null, null, null, null];

  if (endDay === null || firstMatchDay === null || startDay === null || endMonth === null || subsequentMatchDays === null || startMonth === null)
    throw { id: 4, sendError: true, message: "Invalid Competition start/end date" };

  const competitionStartDate = new Date(startYear, startMonth, startDay),
    competitionEndDate = new Date(endYear, endMonth, endDay);

  // Get the first match day in the month
  while (competitionStartDate.getDay() !== firstMatchDay) competitionStartDate.setDate(competitionStartDate.getDate() + 1);

  // Add subsequent days to dates array
  while (competitionStartDate.getTime() <= competitionEndDate.getTime()) {
    for (const days of subsequentMatchDays) {
      if (competitionStartDate.getTime() > competitionEndDate.getTime()) break;
      datesArray.push(competitionStartDate.toDateString()) && competitionStartDate.setDate(competitionStartDate.getDate() + days);
    }
  }

  console.log({
    datesArray,
  });

  return datesArray;
}

interface GenMatchWeeks {
  clubs: string[];
  totalClubs: number;
  awayFixture: boolean;
}

function genMatchWeeks({ clubs, totalClubs, awayFixture }: GenMatchWeeks) {
  const homeFixtures = [],
    awayFixtures = [];

  for (let i = 0; i < totalClubs - 1; i++) {
    const homeRound = [];
    const awayRound = [];
    const tossCoin = (i + 1) % 2 === 0;

    for (let j = 0; j < totalClubs / 2; j++) {
      if (tossCoin) {
        homeRound.push({ home: clubs[j], away: clubs[totalClubs - 1 - j] });
        if (awayFixture) awayRound.push({ home: clubs[totalClubs - 1 - j], away: clubs[j] });
      } else {
        homeRound.push({ home: clubs[totalClubs - 1 - j], away: clubs[j] });
        if (awayFixture) awayRound.push({ home: clubs[j], away: clubs[totalClubs - 1 - j] });
      }
    }

    if (awayFixture) awayFixtures.push(shuffleArray(awayRound));
    homeFixtures.push(shuffleArray(homeRound));

    const lastClub = clubs.pop(); // <= Rotate the array (keep the first club fixed)
    if (lastClub !== undefined) clubs.splice(1, 0, lastClub);
  }

  return awayFixture ? [...shuffleArray(homeFixtures), ...shuffleArray(awayFixtures)] : shuffleArray(homeFixtures);
}

interface GenComptTable {
  world: string;
  clubs: string[];
  group: number | null;
  competition: string;
}
function genComptTable({ clubs, group, competition, world }: GenComptTable): Table[] {
  return clubs.map((club) => {
    return { club, w: 0, d: 0, l: 0, ga: 0, gd: 0, gf: 0, pts: 0, pld: 0, group, competition, world };
  });
}

interface GenLeagueFixtures {
  clubs: string[];
  competition: string;
  world: string;
  group: number | null;
  matchDatesCompt?: string;
}
function genLeagueFixtures({ clubs, competition, world, group, matchDatesCompt }: GenLeagueFixtures): Calendar[] {
  const totalClubs = clubs.length,
    fixtures: Calendar[] = [],
    datesArray = getMatchDates(matchDatesCompt || competition),
    matchWeeks = genMatchWeeks({ clubs, totalClubs, awayFixture: true });

  matchWeeks.forEach((round, tempWeek) => {
    const initMatchDate = datesArray.shift(),
      [week, firstMatchDate, lastMatchDate] = [tempWeek + 1, initMatchDate, competition === "world_tier_2" ? initMatchDate : datesArray.shift()]; // <= Similitate Saturday/Sunday matches

    if (firstMatchDate === undefined || lastMatchDate === undefined) {
      throw { id: 4, message: "Out of Fixture date range for " + competition };
    }

    const currRound = round
      .map(({ home, away }: { home: string; away: string }, i: number) => {
        if (competition.startsWith("world_tier_")) {
          const matchDay = totalClubs / 2 / 2,
            selectedMatchTime = matchTimes.tier,
            matchDate = new Date(matchDay > i ? firstMatchDate : lastMatchDate),
            selectedTime = selectedMatchTime[range(0, selectedMatchTime.length - 1)].split(":");

          matchDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

          return { home, away, week, date: matchDate, hg: 0, ag: 0, group, world, competition };
        } else {
          const matchDay = totalClubs / 2 / 2,
            [sunMatchTime, satMatchTime] = matchTimes.league,
            matchDate = new Date(matchDay > i ? firstMatchDate : lastMatchDate),
            selectedMatchTime = matchDate.getDay() === 0 ? sunMatchTime : satMatchTime,
            selectedTime = selectedMatchTime[range(0, selectedMatchTime.length - 1)].split(":");

          matchDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

          return { home, away, week, date: matchDate, hg: 0, ag: 0, group, world, competition };
        }
      })
      .sort((a: any, b: any) => new Date(a.date).getHours() - new Date(b.date).getHours());
    fixtures.push(...currRound);
  });

  return fixtures;
}

interface GenShieldFixtures {
  world: string;
  country: string;
  table: Table[];
  group: number | null;
  existingWorld: boolean;
}
async function genShieldFixtures({ country, world, group, existingWorld, table }: GenShieldFixtures): Promise<Calendar[]> {
  const competition = country + "_shield";

  const shieldClubs: string[] = [];

  if (existingWorld) {
    const topLaegueClubs = (
      await GAMES_TABLE.find({ world, competition: country + "_one_league" })
        .sort({ pts: -1, w: -1, gf: -1, gd: -1, ga: 1, d: 1, l: 1 })
        .limit(4)
    ).map((data) => data?.club);

    const finalCupClubs: string[] = (await GAMES_CALENDAR.find({ world, competition: country + "_cup", group: "2" })).flatMap((data) => [
      data.home,
      data.away,
    ]) as string[];

    shieldClubs.push(...finalCupClubs);
    topLaegueClubs.forEach((club) => {
      if (shieldClubs.length < 4 && !shieldClubs.includes(club!)) shieldClubs.push(club!);
    });
  } else {
    shieldClubs.push(...[...table].splice(0, 4).map((data) => data.club));
  }

  const clubs = shuffleArray(shieldClubs),
    totalClubs = clubs.length;

  if (totalClubs !== 4) throw { id: 4, sendError: true, message: competition + " selected Clubs is insufficient" };

  const days = getMatchDates(competition),
    matchTime = shuffleArray(matchTimes.shield),
    dates = [days[0], days[0], days[1], days[1], days[2]];

  const matchDates = dates
    .map((date, index) => {
      const initDate = new Date(date),
        [hour, minutes] = matchTime[index].split(":");

      return new Date(initDate.setHours(Number(hour), Number(minutes)));
    })
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const fixtures: Calendar[] = [
    { home: clubs[1], away: clubs[0], hg: 0, ag: 0, week: 1, competition, group, date: matchDates[0], world },
    { home: clubs[2], away: clubs[3], hg: 0, ag: 0, week: 1, competition, group, date: matchDates[1], world },
    { home: clubs[0], away: clubs[1], hg: 0, ag: 0, week: 2, competition, group, date: matchDates[2], world },
    { home: clubs[3], away: clubs[2], hg: 0, ag: 0, week: 2, competition, group, date: matchDates[3], world },
    { home: "c1", away: "c2", hg: 0, ag: 0, week: 3, competition, group, date: matchDates[4], world },
  ];

  return fixtures;
}

interface GenCupFixtures {
  world: string;
  country: string;
  table: Table[];
  existingWorld: boolean;
}
async function genCupFixtures({ country, world, existingWorld, table }: GenCupFixtures): Promise<Calendar[]> {
  const countryCupClubs: string[] = [],
    competition = `${country}_cup`;

  for (const division of DIVISIONS) {
    const currNoCupClubs: number = countryCupClubs.length;
    if (currNoCupClubs >= maxNoCupClubs) break; // Break out of the loop

    if (existingWorld) {
      const competition = `${country}_${division}_league`,
        comptTable = await GAMES_TABLE.find({ world, competition }).sort({ pts: -1, w: -1, gf: -1, gd: -1, ga: 1, d: 1, l: 1 });

      if (!comptTable) throw { id: 4, sendError: true, message: "Competition table not found" };

      const clubs = comptTable.map((data) => data.club);
      countryCupClubs.push(...shuffleArray(clubs.splice(0, maxNoCupClubs - currNoCupClubs)));
    } else {
      const competition = `${country}_${division}_league`,
        comptTable = table.filter((data) => data.competition === competition);

      if (!comptTable) throw { id: 4, sendError: true, message: "Competition table not found" };

      const clubs = comptTable.map((data) => data.club);
      countryCupClubs.push(...shuffleArray(clubs.splice(0, maxNoCupClubs - currNoCupClubs)));
    }
  }

  if (countryCupClubs.length !== maxNoCupClubs) {
    throw { id: 4, sendError: true, message: "Competitions Cup not equal to " + maxNoCupClubs };
  }

  let round = maxNoCupClubs;
  const datesArray = getMatchDates(country + "_cup"),
    roundFixtures: { [key: string]: Calendar[] } = {};

  while (round >= 2) {
    let [firstMatchDate, midMatchDate, lastMatchDate] = ["", "", ""];

    if (round > 8) {
      //  ? Similitate Saturday/Sunday matches
      const [tempFirstMatchDate, tempMidMatchDate, tempLastMatchDate] = [datesArray.shift(), datesArray.shift(), datesArray.shift()];

      if (tempFirstMatchDate === undefined || tempMidMatchDate === undefined || tempLastMatchDate === undefined) {
        throw { id: 4, message: "Out of Fixture date range for " + competition + " in multi date" };
      }

      [firstMatchDate, midMatchDate, lastMatchDate] = [tempFirstMatchDate, tempMidMatchDate, tempLastMatchDate];

      if (firstMatchDate === "" || midMatchDate === "" || lastMatchDate === "") throw { id: 4, message: "Invalid Fixture date for " + competition };

      datesArray.shift(); // skip one week to create interval before next knockout round
      datesArray.shift(); // skip one week to create interval before next knockout round
      datesArray.shift(); // skip one week to create interval before next knockout round
    } else if ([4, 8].includes(round)) {
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

    const clubsIndex = shuffleArray(Array.from({ length: round }, (_, i) => i + 1));
    const currRoundMatch = createSubarrays(clubsIndex, 2);

    roundFixtures[round] = currRoundMatch.map(([homeClub, awayClub], index) => {
      const tripleMatchDay = index % 3,
        doubleMatchDay = index % 2 === 0,
        selectedTime = matchTimes.cup[range(0, matchTimes.cup.length - 1)].split(":"),
        selectedDate =
          round === 2
            ? new Date(firstMatchDate)
            : [4, 8].includes(round)
            ? new Date(doubleMatchDay ? firstMatchDate : lastMatchDate)
            : new Date(tripleMatchDay === 0 ? lastMatchDate : tripleMatchDay === 1 ? midMatchDate : firstMatchDate);

      selectedDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

      return {
        world,
        hg: 0,
        ag: 0,
        week: 0,
        competition,
        group: round,
        date: selectedDate,
        home: `r${round}-c${homeClub}`,
        away: `r${round}-c${awayClub}`,
      };
    });

    round /= 2;
  }

  const fixtures: Calendar[] = [];

  for (const round in roundFixtures) {
    if (Number(round) === maxNoCupClubs) {
      fixtures.push(
        ...roundFixtures[round].map((fixture) => ({
          ...fixture,
          home: countryCupClubs[Number(fixture.home.replace(`r${round}-c`, "")) - 1],
          away: countryCupClubs[Number(fixture.away.replace(`r${round}-c`, "")) - 1],
        }))
      );
    } else {
      fixtures.push(...roundFixtures[round]);
    }
  }

  return fixtures.sort((b, a) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

interface GenWorldTierFixtures {
  tier: number;
  world: string;
  table: Table[];
  countries: string[];
  existingWorld: boolean;
}
async function genWorldTierFixtures({
  tier,
  world,
  existingWorld,
  table,
  countries,
}: GenWorldTierFixtures): Promise<{ calendar: Calendar[]; table: Table[] }> {
  console.log(styleText("cyan", `Getting previous season League table for Game world: ${world}`));

  interface GroupClub {
    club: string;
    league: string;
  }

  const eligibleClubs: GroupClub[] = [];
  for (const country of countries) {
    const competition = country + "_one_league";
    console.log(styleText("cyan", `Extracting ${competition}  table`));

    if (existingWorld) {
      const gameWorldTables = await GAMES_TABLE.find({ world, competition });
      if (!gameWorldTables.length) throw { id: 4, sendError: true, message: "Game world league one table not found" };

      const startClubIndex = tier === 1 ? 4 : 8;
      const clubs: GroupClub[] = [...gameWorldTables]
        .splice(startClubIndex - 4, 4)
        .map((data) => ({ club: data.club as string, league: competition }));

      eligibleClubs.push(...clubs);
    } else {
      const gameWorldTables = table.filter((data) => data.competition === competition);
      if (!gameWorldTables.length) throw { id: 4, sendError: true, message: "Game world league one table not found" };

      const startClubIndex = tier === 1 ? 4 : 8;
      eligibleClubs.push(...[...gameWorldTables].splice(startClubIndex - 4, 4).map((data) => ({ club: data.club, league: competition })));
    }
  }

  console.log(eligibleClubs);

  function generateGroups(eligibleClubs: GroupClub[]) {
    // Shuffle the array to ensure randomness
    const shuffledClubs = shuffleArray([...eligibleClubs]);

    // Initialize the groups array
    const groups: GroupClub[][] = Array.from({ length: Math.ceil(shuffledClubs.length / 4) }, () => []);

    // Distribute clubs into groups
    shuffledClubs.forEach((club: GroupClub) => {
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

    return groups;
  }

  let groupsAreValid = false;
  const tierGroups = [];

  while (!groupsAreValid) {
    const groups: GroupClub[][] = generateGroups(eligibleClubs);
    // GroupClub

    // Check if all groups are valid
    const invalidGroup = groups.find((group) => {
      const leagues = group.map((c) => c.league);
      return new Set(leagues).size !== leagues.length;
    });

    // If any invalid group is found, retry the generation
    if (invalidGroup) {
      console.log(styleText("red", "Tier" + tier + " has a group with multiple teams from same league"));
      // console.log(styleText("cyan", `Retrying in ${retrySeconds} Seconds`));
      console.log(styleText("cyan", `Retrying in Groups regeneration Seconds`));
      // throw "Tier" + tier + " has a group with multiple teams from same league";
    } else {
      tierGroups.push(...groups);
      groupsAreValid = true;
      // clearInterval(groupsIntervalId);
      console.log(styleText("cyan", "Tier" + tier + " groups are valid as no team from same league appear in one group"));
    }
    //
  }

  const worldTierTable: Table[] = tierGroups.flatMap((group, i) =>
    group.map(
      (data) =>
        ({ club: data.club, w: 0, d: 0, l: 0, ga: 0, gd: 0, gf: 0, pts: 0, pld: 0, group: i + 1, competition: `world_tier_${tier}`, world } as Table)
    )
  );

  const worldTierCalendar: Calendar[] = [];
  tierGroups.forEach((groups, i) => {
    if (i === 0) {
      const group = i + 1,
        clubs = groups.map((data) => data.club);

      console.log("generating world tier " + tier + " group stage calendar");

      const groupCalendar = genLeagueFixtures({
        clubs,
        group,
        competition: `world_tier_${tier}`,
        matchDatesCompt: `world_tier_${tier}_group`,
        world,
      });

      worldTierCalendar.push(...groupCalendar);
    }
  });

  // const dates = getMatchDates("world_tier_" + tier + "_group");

  // startClubIndex

  // // if (clubs.length !== 32) throw { id: 4, sendError: true, message: competition + " total clubs must be 32" };

  // // const eligibleClubs = shuffleArray(clubs);

  //
  //

  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");

  return { calendar: worldTierCalendar, table: worldTierTable };
}
