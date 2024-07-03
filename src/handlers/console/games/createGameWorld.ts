import validate from "../../../utils/validate";

import { MongoServerError, ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import { Request, Response } from "express";
import { ENDPOINTS } from "../../../models/apihub";
import { ObjectEntries, catchError, requestHasBody, shuffleArray, sleep, textToId } from "../../../utils/handlers";

// utils/sse.js
import { GAMES_STATISTIC } from "../../../models/games";
import {
  initDivisionLeagueFixtures,
  initDivisionCupFixtures,
  initDivisionSuperCupFixtures,
  initWorldSuperCupFixtures,
  initWorldTier1Fixtures,
} from "../../../utils/fixtures";
import { DIVISIONS } from "../../../utils/constants";
import { Fixtures } from "../../../interface/games.interface";

const [streamDelay, divisions] = [0, ["one", "two"]],
  streamResponse = (data: number, success: boolean, message: string) => `data: ${JSON.stringify({ success, data, message })}\n\n`;

export default async (req: Request, res: Response) => {
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });

  try {
    requestHasBody({ body: req.body, required: ["title"], sendError: true });
    res.write(streamResponse(1, true, "Verifying requirements to create a new Game world"));

    await sleep(streamDelay); // ? <= delay net action

    const { title } = req.body;
    validate({ value: title, type: "comment", sendError: true, label: "Title" });
    res.write(streamResponse(2, true, "Validate input, and creating Game World ID/Reference"));

    await GAMES_STATISTIC.deleteOne({ title });
    const gameWorld = await GAMES_STATISTIC.create({ title })
      .then((dbRes) => {
        res.write(streamResponse(3, true, "Creating Game World ID/Reference"));
        return dbRes;
      })
      .catch((err: MongoServerError) => {
        if (err.code === 11000) throw { sendError: true, message: "Game World already exists", id: 3 };
        throw { sendError: true, message: "Failed to create Game World", id: 3 };
      });

    await sleep(streamDelay); // ? <= delay net action

    const calendar: Fixtures[] = [];
    if (!gameWorld.unmanaged) throw { sendError: true, message: "Unmanaged Clubs not found", id: 4 };

    let [nextSliceIndex, totalWorldClubs] = [0, 0];
    const leagues: { [key: string]: string[] } = {},
      initClubs = shuffleArray(Array.from({ length: 314 }, (_, i) => "club" + (i + 1).toString().padStart(7, "0")));

    // ! Generate league fixtures
    for (const [league, totalClubs] of ObjectEntries(gameWorld.unmanaged)) {
      totalWorldClubs += totalClubs;

      // create batch of totalClubs for each league
      leagues[league] = initClubs.slice(nextSliceIndex, totalClubs + nextSliceIndex);

      const fixtures = initDivisionLeagueFixtures(leagues[league], `${league}_league`);
      calendar.push(...fixtures);

      nextSliceIndex = totalClubs + nextSliceIndex;
    }

    if (nextSliceIndex !== 314) throw { sendError: true, message: "League size exceeded", id: 4 };
    if (totalWorldClubs !== 314) throw { sendError: true, message: "Invalid League size", id: 4 };

    const countries: { country: string; clubs: number }[] = [];
    for (const [league, totalClubs] of ObjectEntries(gameWorld.unmanaged)) {
      const regex = new RegExp(DIVISIONS.map((division) => `_${division}`).join("|"), "g"),
        country = league.replace(regex, ""),
        countryIndex = countries.findIndex((x) => x.country === country);

      if (countryIndex >= 0) {
        const data = countries[countryIndex];
        countries[countryIndex] = { country, clubs: data.clubs + totalClubs };
      } else {
        countries.push({ country, clubs: totalClubs });
      }
    }

    // ! Generate Cup fixtures
    for (const { country, clubs: totalClubs } of countries) {
      const clubs = DIVISIONS.flatMap((division) => leagues[country + `_${division}`]),
        fixtures = initDivisionCupFixtures(clubs, `${country}_cup`);

      calendar.push(...fixtures);
    }

    // ! Generate Super Cup fixtures
    for (const { country, clubs: totalClubs } of countries) {
      const clubs = DIVISIONS.flatMap((division) => leagues[country + `_${division}`]),
        fixtures = initDivisionSuperCupFixtures(clubs, `${country}_super_cup`);

      calendar.push(...fixtures);
    }

    // ! Generate World Super Cup fixtures
    calendar.push(...initWorldSuperCupFixtures(["club1", "club2"], "world_super_cup"));
    calendar.forEach(({ date, competition }) => console.log({ d: new Date(date).toDateString(), c: competition }));

    // ! Generate World Tier1  fixtures
    // for (const { country, clubs: totalClubs } of countries) {

    const eligibleClubs: { club: string; league: string }[] = [];
    for (const [league, clubs] of ObjectEntries(leagues)) {
      if (league.toString().endsWith("_one")) {
        [0, 1, 2, 3].map((index) => eligibleClubs.push({ club: clubs[index], league }));
      }
    }

    const worldTier1fixtures = initWorldTier1Fixtures(eligibleClubs, "world_tier1");
    // console.log({ eligibleClubs });

    // const clubs =

    // leagues[country + `_${division}`]);

    // const clubs = DIVISIONS.flatMap((division) => leagues[country + `_${division}`]),

    // calendar.push(...fixtures);
    // }

    // console.log({ fixtures });

    // console.log({ countries });

    // league, totalClubs;

    // totalWorldClubs += totalClubs;

    // // create batch of totalClubs for each league
    // leagues[league] = initClubs.slice(nextSliceIndex, totalClubs + nextSliceIndex);

    // const fixtures = initDivisionLeagueFixtures(leagues[league], league);
    // calendar.push(...fixtures);

    // Generating Game World Calendar
    // Generating Game World Tables
    // Generating Game World Club
    // Compiling Stat, Calendar, Tables and Club
    // Populating Database
    // Game World has been created succesfully

    return res.end();
  } catch (err: any) {
    if (err.sendError && err.type === "validate") {
      res.write(streamResponse(1, false, err.description && err.description.message));
      return res.end();
    } else if (err.sendError && err.id && err.message) {
      res.write(streamResponse(err.id, false, err.message));
      return res.end();
    } else {
      return catchError({ res, err: err?.message ? { ...err, type: "stream" } : err });
    }
  }
};
