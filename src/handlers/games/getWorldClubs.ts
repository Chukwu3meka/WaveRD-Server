import { Request, Response } from "express";
import { GAMES_CLUB, GAMES_STATISTIC } from "../../models/games";
import { ObjectEntries, catchError, range, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.params, required: ["world", "division"], sendError: true });

    const { division, world } = req.params;
    if (!division || !world) throw { message: `Invalid World/Tournament provided` };

    const divisions: { [key: string]: string[] } = {},
      initClubs = Array.from({ length: 314 }, (_, i) => "club" + (i + 1).toString().padStart(7, "0"));

    const clubs: { club: string; world: string; division: string }[] = [];

    const result = await GAMES_CLUB.find(
      { world, division },
      {
        //
        reference: true,
        club: true,
        manager: true,
        budget: true,
        _id: false,
        division: true,
      }
    );

    const data = { success: true, data: result, message: result.length ? "Clubs retrieved successfully" : "Failed to retrieve any Club" };
    return res.status(200).json(data);
  } catch (err: any) {
    if (err.sendError && err.type === "validate") {
      const data = { success: false, message: err.description && err.description.message, data: null };
      return res.status(400).json(data);
    }

    return catchError({ res, err });
  }
};
