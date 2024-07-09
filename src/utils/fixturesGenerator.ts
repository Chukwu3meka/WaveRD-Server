import { Response } from "express";
import { DIVISIONS } from "./constants";
import { Calendar, Table } from "../interface/games.interface";
import { createSubarrays, range, shuffleArray, sleep } from "./handlers";
import { GAMES_CALENDAR, GAMES_CLUB, GAMES_TABLE } from "../models/games";

const maxNoCupClubs = 32;

interface GenComptTable {
  world: string;
  clubs: string[];
  group: number | null;
  competition: string;
}

interface GenLeagueFixtures {
  clubs: string[];
  competition: string;
  world: string;
  group: number | null;
}

interface GenShieldFixtures {
  world: string;
  country: string;
  table: Table[];
  group: number | null;
  existingWorld: boolean;
}

interface GenCupFixtures {
  world: string;
  country: string;
  table: Table[];
  existingWorld: boolean;
}

interface GenMatchWeeks {
  clubs: string[];
  totalClubs: number;
  awayFixture: boolean;
}

interface GenWorldTierFixtures {
  tier: number;
  world: string;
  table: Table[];
  countries: string[];
  existingWorld: boolean;
}

interface GroupClub {
  club: string;
  league: string;
}

export class FixturesGenerator {
  private res?: Response;
  private worldRef: string = "";
  private existingWorld: boolean = true;

  constructor(initWorldRef: string, initExistingWorld: boolean, initResponse: Response) {
    if (!initWorldRef) throw { sendError: true, message: "Game World is undefined" };

    this.res = initResponse;
    this.worldRef = initWorldRef;
    this.existingWorld = initExistingWorld;
  }

  readonly matchTimes = {
    league: [
      ["12:30", "15:00", "17:30", "20:00"],
      ["12:00", "14:00", "16:30"],
    ],
    tier: ["21:00", "19:45"],
    shield: ["12:30", "15:30", "17:45", "19:45", "21:0"],
    cup: ["12:00", "12:30", "15:00", "17:30", "18:00", "19:45"],
  };

  private async streamResponse(status: "failed" | "success" | "pending", message: string) {
    if (!this.res) throw { sendError: true, message: "Response is not defined" };

    this.res.write(`data: ${JSON.stringify({ success: true, data: status, message })}\n\n`);
    if (status === "pending") await sleep(1); // ? <= delay next action
  }

  async generateFixtures() {
    const { worldRef, existingWorld } = this;

    await this.streamResponse("pending", `Verify that Game World has been created and has clubs in it`);
    const gameWorldClubs = await GAMES_CLUB.find({ world: worldRef });

    if (gameWorldClubs.length < 160) {
      await this.streamResponse("failed", `Verify that Game World has been created and has clubs in it`);
      throw { sendError: true, message: "Game world clubs not found" };
    }

    await this.streamResponse("success", `Verify that Game World has been created and has clubs in it`);

    const leagues: string[] = [];
    const countries: string[] = [];
    const leagueClubs: { [league: string]: string[] } = {};

    await this.streamResponse("pending", `Map through each clubs to extract Country, League and Club ref inorder to create League Clubs Array`);
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
    await this.streamResponse("success", `Map through each clubs to extract Country, League and Club ref inorder to create League Clubs Array`);

    const calendar: Calendar[] = [],
      table: Table[] = [];

    await this.streamResponse("pending", `Map through Leagues to ensure Clubs are even and in order to generate Calendar and Table`);
    for (const competition of leagues) {
      const clubs = leagueClubs[competition];
      if (!clubs) throw { sendError: true, message: "Clubs is indefined" };
      if (clubs.length % 2 !== 0) throw { sendError: true, message: "Clubs length is not even" };

      // ? Generate League Calendar and Table
      await this.streamResponse("pending", `Generating ${competition} League Table`);
      const leagueTable = this.genComptTable({ clubs, group: null, competition: competition + "_league", world: worldRef });
      await this.streamResponse("success", `Generating ${competition} League Table`);

      await this.streamResponse("pending", `Generating ${competition} League Calendar`);
      const leagueCalendar = this.genLeagueFixtures({ clubs, group: null, competition: competition + "_league", world: worldRef });
      await this.streamResponse("success", `Generating ${competition} League Calendar`);

      table.push(...leagueTable);
      calendar.push(...leagueCalendar);
    }
    await this.streamResponse("success", `Map through Leagues to ensure Clubs are even and in order to generate Calendar and Table`);

    await this.streamResponse("pending", `Mapping through countries to generate Cup and Shield Calendar`);
    for (const country of countries) {
      await this.streamResponse("pending", `Generating ${country} Cup Calendar`);
      const cupCalendar = await this.genCupFixtures({ country, world: worldRef, existingWorld, table }); // <= Generate Cup Calendar
      await this.streamResponse("success", `Generating ${country} Cup Calendar`);

      await this.streamResponse("pending", `Generating ${country} Shield Calendar`);
      const shieldCalendar = await this.genShieldFixtures({ group: null, country, world: worldRef, existingWorld, table }); // <= Generate Shield Calendar
      await this.streamResponse("success", `Generating ${country} Shield Calendar`);

      calendar.push(...cupCalendar, ...shieldCalendar);
    }
    await this.streamResponse("success", `Mapping through countries to generate Cup and Shield Calendar`);

    await this.streamResponse("pending", `Generating World Tier one fixtures`);
    const { calendar: worldTier1Calendar, table: worldTier1Table } = await this.genWorldTierFixtures({
      tier: 1,
      world: worldRef,
      existingWorld,
      table,
      countries,
    });
    await this.streamResponse("success", `Generating World Tier one fixtures`);

    await this.streamResponse("pending", `Generating World Tier two fixtures`);
    const { calendar: worldTier2Calendar, table: worldTier2Table } = await this.genWorldTierFixtures({
      tier: 2,
      world: worldRef,
      existingWorld,
      table,
      countries,
    });
    await this.streamResponse("success", `Generating World Tier two fixtures`);

    table.push(...worldTier1Table, ...worldTier2Table);
    calendar.push(...worldTier1Calendar, ...worldTier2Calendar);

    await GAMES_TABLE.insertMany(table);
    await GAMES_CALENDAR.insertMany(calendar);

    await this.streamResponse("success", " ");
    await this.streamResponse("success", " ");
    await this.streamResponse("success", " ");
    await this.streamResponse("success", " ");
    await this.streamResponse("success", " ");
    await this.streamResponse("success", " ");
    await this.streamResponse("success", " ");
  }

  private getMatchDates(competition: string): string[] {
    const datesArray = [];

    const currentYear = new Date().getFullYear(),
      [startYear, startMonth, startDay, endYear, endMonth, endDay, firstMatchDay, subsequentMatchDays] = competition.endsWith("_league")
        ? [currentYear, 7, 15, currentYear + 1, 5, 30, 6, [1, 6]]
        : competition.endsWith("_cup")
        ? [currentYear, maxNoCupClubs > 32 ? 9 : 11, 8, currentYear + 1, 5, 30, 4, [7]]
        : competition.endsWith("_shield")
        ? [currentYear, 0, 1, currentYear, 0, 21, 4, [7]]
        : competition.endsWith("world_tier_1_group")
        ? [currentYear, 8, 15, currentYear, 11, 7, 2, [1, 6, 1, 20, 1, 6, 1, 6, 1, 6, 1, 20]]
        : competition.endsWith("world_tier_2_group")
        ? [currentYear, 8, 22, currentYear, 11, 7, 4, [7, 21, 7, 14, 7, 21]]
        : competition.endsWith("world_tier_1_knockout")
        ? [currentYear + 1, 1, 8, currentYear + 1, 5, 8, 2, [1, 6, 1, 13, 1, 6, 1, 27, 1, 6, 1, 20, 1, 6, 1, 21]]
        : competition.endsWith("world_tier_2_knockout")
        ? [currentYear + 1, 1, 15, currentYear + 1, 4, 31, 4, [7, 14]]
        : [];

    const validDate = [startYear, startMonth, startDay, endYear, endMonth, endDay, firstMatchDay, subsequentMatchDays].every(
      (entity) => entity !== null && entity !== undefined
    );

    if (!validDate) throw { sendError: true, message: "Invalid Competition start/end date" };

    const competitionEndDate = new Date(endYear!, endMonth!, endDay!),
      competitionStartDate = new Date(startYear!, startMonth!, startDay!);

    // Get the first match day in the month
    while (competitionStartDate.getDay() !== firstMatchDay) competitionStartDate.setDate(competitionStartDate.getDate() + 1);

    // Add subsequent days to dates array
    while (competitionStartDate.getTime() <= competitionEndDate.getTime()) {
      for (const days of subsequentMatchDays!) {
        if (competitionStartDate.getTime() > competitionEndDate.getTime()) break;
        datesArray.push(competitionStartDate.toDateString()) && competitionStartDate.setDate(competitionStartDate.getDate() + days);
      }
    }

    return datesArray;
  }

  private genMatchWeeks({ clubs, totalClubs, awayFixture }: GenMatchWeeks) {
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

  private genComptTable({ clubs, group, competition, world }: GenComptTable): Table[] {
    return clubs.map((club) => {
      return { club, w: 0, d: 0, l: 0, ga: 0, gd: 0, gf: 0, pts: 0, pld: 0, group, competition, world };
    });
  }

  private genLeagueFixtures({ clubs, competition, world, group }: GenLeagueFixtures): Calendar[] {
    const totalClubs = clubs.length,
      fixtures: Calendar[] = [],
      datesArray = this.getMatchDates(competition),
      matchWeeks = this.genMatchWeeks({ clubs, totalClubs, awayFixture: true });

    matchWeeks.forEach((round, tempWeek) => {
      const week = tempWeek + 1,
        initMatchDate = datesArray.shift(),
        [firstMatchDate, lastMatchDate] = [initMatchDate, competition.endsWith("_league") ? datesArray.shift() : initMatchDate];

      if (firstMatchDate === undefined || lastMatchDate === undefined) {
        throw { sendError: true, message: "Out of Fixture date range for " + competition };
      }

      const currRound = round
        .map(({ home, away }: { home: string; away: string }, i: number) => {
          if (competition.startsWith("world_tier_")) {
            const matchDay = totalClubs / 2 / 2,
              selectedMatchTime = this.matchTimes.tier,
              matchDate = new Date(matchDay > i ? firstMatchDate : lastMatchDate),
              selectedTime = selectedMatchTime[range(0, selectedMatchTime.length - 1)].split(":");

            matchDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

            return { home, away, week, date: matchDate, hg: 0, ag: 0, group, world, competition };
          } else {
            const matchDay = totalClubs / 2 / 2,
              [sunMatchTime, satMatchTime] = this.matchTimes.league,
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

  private async genShieldFixtures({ country, world, group, existingWorld, table }: GenShieldFixtures): Promise<Calendar[]> {
    const competition = country + "_shield";

    const shieldClubs: string[] = [];

    if (existingWorld) {
      const topLaegueClubs = (
        await GAMES_TABLE.find({ world, competition: country + "_one_league" })
          .sort({ pts: -1, w: -1, gf: -1, gd: -1, ga: 1, d: 1, l: 1 })
          .limit(4)
      ).map((data) => data?.club);

      const finalCupClubs: string[] = (await GAMES_CALENDAR.find({ world, competition: country + "_cup", group: "2" })).flatMap(({ home, away }) => [
        home,
        away,
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

    if (totalClubs !== 4) throw { sendError: true, message: competition + " selected Clubs is insufficient" };

    const days = this.getMatchDates(competition),
      matchTime = shuffleArray(this.matchTimes.shield),
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

  private async genCupFixtures({ country, world, existingWorld, table }: GenCupFixtures): Promise<Calendar[]> {
    const countryCupClubs: string[] = [],
      competition = `${country}_cup`;

    for (const division of DIVISIONS) {
      const currNoCupClubs: number = countryCupClubs.length;
      if (currNoCupClubs >= maxNoCupClubs) break; // Break out of the loop

      if (existingWorld) {
        const competition = `${country}_${division}_league`,
          comptTable = await GAMES_TABLE.find({ world, competition }).sort({ pts: -1, w: -1, gf: -1, gd: -1, ga: 1, d: 1, l: 1 });

        if (!comptTable) throw { sendError: true, message: "Competition table not found" };

        const clubs = comptTable.map((data) => data.club);
        countryCupClubs.push(...shuffleArray(clubs.splice(0, maxNoCupClubs - currNoCupClubs)));
      } else {
        const competition = `${country}_${division}_league`,
          comptTable = table.filter((data) => data.competition === competition);

        if (!comptTable) throw { sendError: true, message: "Competition table not found" };

        const clubs = comptTable.map((data) => data.club);
        countryCupClubs.push(...shuffleArray(clubs.splice(0, maxNoCupClubs - currNoCupClubs)));
      }
    }

    if (countryCupClubs.length !== maxNoCupClubs) {
      throw { sendError: true, message: "Competitions Cup not equal to " + maxNoCupClubs };
    }

    let round = maxNoCupClubs;
    const datesArray = this.getMatchDates(country + "_cup"),
      roundFixtures: { [key: string]: Calendar[] } = {};

    while (round >= 2) {
      let [firstMatchDate, midMatchDate, lastMatchDate] = ["", "", ""];

      if (round > 8) {
        //  ? Similitate Saturday/Sunday matches
        const [tempFirstMatchDate, tempMidMatchDate, tempLastMatchDate] = [datesArray.shift(), datesArray.shift(), datesArray.shift()];

        if (tempFirstMatchDate === undefined || tempMidMatchDate === undefined || tempLastMatchDate === undefined) {
          throw { message: "Out of Fixture date range for " + competition + " in multi date" };
        }

        [firstMatchDate, midMatchDate, lastMatchDate] = [tempFirstMatchDate, tempMidMatchDate, tempLastMatchDate];

        if (!firstMatchDate || !midMatchDate || !lastMatchDate) throw { message: "Invalid Fixture date for " + competition };

        datesArray.shift(); // skip one week to create interval before next knockout round
        datesArray.shift(); // skip one week to create interval before next knockout round
        datesArray.shift(); // skip one week to create interval before next knockout round
      } else if ([4, 8].includes(round)) {
        //  ? Similitate Saturday/Sunday matches
        const [tempFirstMatchDate, tempLastMatchDate] = [datesArray.shift(), datesArray.shift()];

        if (tempFirstMatchDate === undefined || tempLastMatchDate === undefined) {
          throw { message: "Out of Fixture date range for " + competition + " in multi date" };
        }

        [firstMatchDate, lastMatchDate] = [tempFirstMatchDate, tempLastMatchDate];

        if (firstMatchDate === "" || lastMatchDate === "") throw { message: "Invalid Fixture date for " + competition };
      } else {
        const date = datesArray.shift();
        if (date === undefined) throw { message: "Out of Fixture date range for " + competition + " in single date" };

        firstMatchDate = date;
      }

      const clubsIndex = shuffleArray(Array.from({ length: round }, (_, i) => i + 1));
      const currRoundMatch = createSubarrays(clubsIndex, 2);

      roundFixtures[round] = currRoundMatch.map(([homeClub, awayClub], index) => {
        const tripleMatchDay = index % 3,
          doubleMatchDay = index % 2 === 0,
          selectedTime = this.matchTimes.cup[range(0, this.matchTimes.cup.length - 1)].split(":"),
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

  private async genWorldTierFixtures({
    tier,
    world,
    existingWorld,
    table,
    countries,
  }: GenWorldTierFixtures): Promise<{ calendar: Calendar[]; table: Table[] }> {
    const eligibleClubs: GroupClub[] = [];
    await this.streamResponse("pending", `Getting previous season League table for Game world: ${world}`);

    for (const country of countries) {
      const competition = country + "_one_league";
      if (existingWorld) {
        const gameWorldTables = await GAMES_TABLE.find({ world, competition });
        if (!gameWorldTables.length) throw { sendError: true, message: "Game world league one table not found" };

        const startClubIndex = tier === 1 ? 4 : 8;
        const clubs: GroupClub[] = [...gameWorldTables]
          .splice(startClubIndex - 4, 4)
          .map((data) => ({ club: data.club as string, league: competition }));

        eligibleClubs.push(...clubs);
      } else {
        const gameWorldTables = table.filter((data) => data.competition === competition);
        if (!gameWorldTables.length) throw { sendError: true, message: "Game world league one table not found" };

        const startClubIndex = tier === 1 ? 4 : 8;
        eligibleClubs.push(...[...gameWorldTables].splice(startClubIndex - 4, 4).map((data) => ({ club: data.club, league: competition })));
      }
    }
    await this.streamResponse("success", `Getting previous season League table for Game world: ${world}`);

    function generateGroups(eligibleClubs: GroupClub[]) {
      const shuffledClubs = shuffleArray([...eligibleClubs]),
        groups: GroupClub[][] = Array.from({ length: Math.ceil(shuffledClubs.length / 4) }, () => []);

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

    await this.streamResponse("pending", "Assign clubs to groups in World Tier " + tier);
    while (!groupsAreValid) {
      const groups: GroupClub[][] = generateGroups(eligibleClubs);

      // Check if all groups are valid
      const invalidGroup = groups.find((group) => {
        const leagues = group.map((c) => c.league);
        return new Set(leagues).size !== leagues.length;
      });

      // If any invalid group is found, retry the generation
      if (invalidGroup) {
        await this.streamResponse("failed", `Retrying in Groups regeneration Seconds`);
        await this.streamResponse("pending", "World Tier" + tier + " has a group with multiple teams from same league");
      } else {
        groupsAreValid = true;
        tierGroups.push(...groups);
        await this.streamResponse("success", "World Tier" + tier + " has a group with multiple teams from same league");
      }
    }
    await this.streamResponse("success", "Assign clubs to groups in World Tier " + tier);

    const worldTierTable: Table[] = tierGroups.flatMap((group, i) =>
      group.map((data) => {
        const [club, group, competition] = [data.club, i + 1, `world_tier_${tier}`];
        return { club, w: 0, d: 0, l: 0, ga: 0, gd: 0, gf: 0, pts: 0, pld: 0, group, competition, world } as Table;
      })
    );
    await this.streamResponse("success", "World Tier " + tier + " groups table has been generated");

    const groupStageFixtures: Calendar[] = [];
    await this.streamResponse("pending", "Generating World Tier " + tier + " group stage calendar");

    tierGroups.forEach((groups, i) => {
      if (i === 0) {
        const [group, clubs] = [i + 1, groups.map((data) => data.club)];

        const groupCalendar = this.genLeagueFixtures({ clubs, group, competition: `world_tier_${tier}_group`, world });
        groupStageFixtures.push(...groupCalendar);
      }
    });

    await this.streamResponse("success", "Generating World Tier " + tier + " group stage calendar");

    let round = 16;
    const competition = `world_tier_${tier}_knockout`,
      roundFixtures: { [key: string]: Calendar[] } = {},
      datesArray = this.getMatchDates(competition);

    await this.streamResponse("pending", "Generating World Tier " + tier + " knockout fixtures");
    while (round >= 2) {
      if (round >= 16) {
        const matchDates = [datesArray.shift(), datesArray.shift(), datesArray.shift(), datesArray.shift()];

        if (!matchDates.every((date) => !!date)) {
          throw { message: "Out of Fixture date range for " + competition + " in multi date" };
        }

        // Group matches in two batches
        for (const batch of [1, round / 2 + 1]) {
          const clubsIndex = Array.from({ length: round / 2 }, (_, i) => i + batch);
          const currRoundMatch = createSubarrays(clubsIndex, 2);

          const batchMatchDay = (batch + 1) % 2 === 0;

          for (const leg of [1, 2]) {
            if (roundFixtures[round]) {
              roundFixtures[round].push(
                ...currRoundMatch.map(([homeClub, awayClub], index) => {
                  const legMatchDay = (index + 1) % 2 === 0,
                    selectedTime = this.matchTimes.tier[range(0, this.matchTimes.tier.length - 1)].split(":"),
                    matchDatesIndex = batchMatchDay && legMatchDay ? 0 : batchMatchDay && !legMatchDay ? 1 : !batchMatchDay && legMatchDay ? 2 : 3;

                  const selectedDate = new Date(matchDates[matchDatesIndex]!);

                  selectedDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

                  const [home, away] = [`r${round}-c${homeClub}`, `r${round}-c${awayClub}`];
                  return { world, hg: 0, ag: 0, week: leg, competition, group: round, date: selectedDate, home, away };
                })
              );
            } else {
              roundFixtures[round] = currRoundMatch.map(([awayClub, homeClub], index) => {
                const legMatchDay = (index + 1) % 2 === 0,
                  selectedTime = this.matchTimes.tier[range(0, this.matchTimes.tier.length - 1)].split(":"),
                  matchDatesIndex = batchMatchDay && legMatchDay ? 0 : batchMatchDay && !legMatchDay ? 1 : !batchMatchDay && legMatchDay ? 2 : 3;

                const selectedDate = new Date(matchDates[matchDatesIndex]!);

                selectedDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

                const [home, away] = [`r${round}-c${homeClub}`, `r${round}-c${awayClub}`];
                return { world, hg: 0, ag: 0, week: leg, competition, group: round, date: selectedDate, home, away };
              });
            }
          }
        }
      } else if (round > 2) {
        const clubsIndex = shuffleArray(Array.from({ length: round }, (_, i) => i + 1));
        const currRoundMatch = createSubarrays(clubsIndex, 2);

        for (const leg of [1, 2]) {
          const initDate = datesArray.shift(),
            [firstMatchDate, lastMatchDate] = [initDate, tier === 1 ? datesArray.shift() : initDate];

          if (firstMatchDate === undefined || lastMatchDate === undefined) {
            throw { message: "Out of Fixture date range for " + competition + " in multi date" };
          }

          if (roundFixtures[round]) {
            roundFixtures[round].push(
              ...currRoundMatch.map(([homeClub, awayClub], index) => {
                const doubleMatchDay = index % 2 === 0,
                  selectedTime = this.matchTimes.tier[range(0, this.matchTimes.tier.length - 1)].split(":"),
                  selectedDate = round === 2 ? new Date(firstMatchDate) : new Date(doubleMatchDay ? firstMatchDate : lastMatchDate);
                selectedDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

                const [home, away] = [`r${round}-c${homeClub}`, `r${round}-c${awayClub}`];

                return { world, hg: 0, ag: 0, week: leg, competition, group: round, date: selectedDate, home, away };
              })
            );
          } else {
            roundFixtures[round] = currRoundMatch.map(([awayClub, homeClub], index) => {
              const doubleMatchDay = index % 2 === 0,
                selectedTime = this.matchTimes.tier[range(0, this.matchTimes.tier.length - 1)].split(":"),
                selectedDate = round === 2 ? new Date(firstMatchDate) : new Date(doubleMatchDay ? firstMatchDate : lastMatchDate);
              selectedDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

              const [home, away] = [`r${round}-c${homeClub}`, `r${round}-c${awayClub}`];

              return { world, hg: 0, ag: 0, week: leg, competition, group: round, date: selectedDate, home, away };
            });
          }
        }
      } else {
        const matchDate = datesArray.shift();

        if (matchDate === undefined) {
          throw { message: "Out of Fixture date range for " + competition + " in multi date" };
        }

        const selectedDate = new Date(matchDate),
          selectedTime = this.matchTimes.tier[range(0, this.matchTimes.tier.length - 1)].split(":");

        selectedDate.setHours(Number(selectedTime[0]), Number(selectedTime[1]));

        const [home, away] = [`r${round}-c${1}`, `r${round}-c${2}`];
        roundFixtures[round] = [{ world, hg: 0, ag: 0, week: 0, competition, group: round, date: selectedDate, home, away }];
      }

      round /= 2;
    }

    const knockoutFixtures: Calendar[] = [];

    for (const round in roundFixtures) knockoutFixtures.push(...roundFixtures[round]);

    await this.streamResponse("success", "Generating World Tier " + tier + " knockout fixtures");

    return {
      table: worldTierTable,
      calendar: [...groupStageFixtures, ...knockoutFixtures],
    };
  }
}
