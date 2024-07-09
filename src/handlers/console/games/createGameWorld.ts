import validate from "../../../utils/validate";

import { MongoServerError } from "mongodb";
import { Request, Response } from "express";
import { GAMES_CLUB, GAMES_STATISTIC } from "../../../models/games";
import { FixturesGenerator } from "../../../utils/fixturesGenerator";
import { ObjectEntries, catchError, requestHasBody, sleep, textToId } from "../../../utils/handlers";

export default async (req: Request, res: Response) => {
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });

  async function streamResponse(status: "failed" | "success" | "pending", message: string) {
    res.write(`data: ${JSON.stringify({ success: true, data: status, message })}\n\n`);
    if (status === "pending") await sleep(1); // ? <= delay next action
  }

  try {
    await streamResponse("pending", "Verifying requirements to create a new Game world");
    requestHasBody({ body: req.body, required: ["title"], sendError: true });

    const [currDate, title] = [new Date(), req.body.title],
      worldRef = `GW-${currDate.getFullYear()}${`${currDate.getMonth() + 1}`.padStart(2, "0")}${`${currDate.getDate() + 1}`.padStart(
        2,
        "0"
      )}-${currDate.getHours()}${currDate.getMinutes()}`;

    validate({ value: title, type: "comment", sendError: true, label: "Title" });
    await streamResponse("success", "Verifying requirements to create a new Game world");

    await streamResponse("pending", "Adding Game World Title/Reference to Database");
    const gameWorld = await GAMES_STATISTIC.create({ title, reference: worldRef })
      .then(async (dbRes) => {
        await streamResponse("success", "Adding Game World Title/Reference to Database");
        return dbRes;
      })
      .catch(async (err: MongoServerError) => {
        if (err.code === 11000) {
          await streamResponse("failed", "Adding Game World Title/Reference to Database");
          throw { sendError: true, message: "Game World already exists" };
        } else {
          await streamResponse("failed", "Failed to generate Game World as Ref already exists");
          throw { sendError: true, message: "Failed to create Game World" };
        }
      });

    if (!gameWorld._id || !gameWorld.unmanaged) {
      await streamResponse("failed", `Database failed to return object for ${title} Game World`);
      throw { sendError: true, message: "Invalid Game World" };
    }

    await streamResponse("pending", `Generating inititial clubs for ${title} Game World`);
    let [nextSliceIndex, totalWorldClubs] = [0, 0];
    const leagues: { [key: string]: string[] } = {},
      initClubs = Array.from({ length: 314 }, (_, i) => "club" + (i + 1).toString().padStart(7, "0"));

    // group clubs into league
    const clubs: { club: string; world: string; league: string }[] = [];
    for (const [league, totalClubs] of ObjectEntries(gameWorld.unmanaged)) {
      // ? create batch of totalClubs for each league
      leagues[league] = initClubs.slice(nextSliceIndex, totalClubs + nextSliceIndex);
      nextSliceIndex = totalClubs + nextSliceIndex;
      totalWorldClubs += totalClubs;

      clubs.push(...leagues[league].map((club) => ({ club, world: worldRef, league })));
    }
    await streamResponse("success", `Generating inititial clubs for ${title} Game World`);

    await streamResponse("pending", `Inserting clubs for ${title} Game World into Games database`);
    await GAMES_CLUB.insertMany(clubs)
      .then(async () => await streamResponse("success", `Inserting clubs for ${title} Game World into Games database`))
      .catch(async () => {
        await streamResponse("failed", `Inserting clubs for ${title} Game World into Games database`);
        throw { sendError: true, message: `Inserting clubs for ${title} Game World into Games database` };
      });

    await streamResponse("pending", `Generating ${title} Game World Fixtures for Cups, Leagues, Shields, World Tiers`);
    await new FixturesGenerator(worldRef, false, res)
      .generateFixtures()
      .then(async () => await streamResponse("success", `Generating ${title} Game World Fixtures for Cups, Leagues, Shields, World Tiers`))
      .catch(async () => {
        await streamResponse("failed", `Generating ${title} Game World Fixtures for Cups, Leagues, Shields, World Tiers`);
        throw { sendError: true, message: `Generating ${title} Game World Fixtures for Cups, Leagues, Shields, World Tiers` };
      });

    await streamResponse("success", `Game world created successfully`);
    return res.end();
  } catch (err: any) {
    if (err.sendError && err.type === "validate") {
      await streamResponse("pending", err.description && err.description.message);
      return res.end();
    } else if (err.sendError && err.message) {
      await streamResponse("failed", err.message);

      return res.end();
    } else {
      return catchError({ res, err: err?.message ? { ...err, type: "stream" } : err });
    }
  }
};
