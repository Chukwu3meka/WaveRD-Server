import { Request, Response } from "express";
import { FED_GAMES_CLUBS } from "../../models/federated";
import { catchError, requestHasBody } from "../../utils/handlers";
import { GAMES_CLUB } from "../../models/games";

export default async function getWorldClub(req: Request, res: Response) {
  try {
    requestHasBody({ body: req.params, required: ["world", "club"], sendError: true });

    const { club, world } = req.params;
    if (!club || !world) throw { sendError: true, message: `Invalid World/Tournament provided` };

    console.log({ club, world });

    const gamesClubData = await GAMES_CLUB.findOne({ world, club });
    if (!gamesClubData) throw { sendError: true, message: `Games Club not found` };

    console.log({ gamesClubData });

    // const result = await FED_GAMES_CLUBS.aggregate([
    //   { $match: { club, world } },
    //   { $lookup: { from: "apihub_clubs", localField: "club", foreignField: "ref", as: "apihub" } },
    //   { $project: { _id: false, ref: "$club", budget: true, manager: true, title: { $arrayElemAt: ["$apihub.title", 0] } } },
    // ]);

    const data = {
      //
      success: true,
      // data: result,
      // message: result.length ? "Clubs retrieved successfully" : "Failed to retrieve any Club",
    };
    return res.status(200).json(data);
  } catch (err: any) {
    if (err.sendError && err.type === "validate") {
      const data = { success: false, message: err.description && err.description.message, data: null };
      return res.status(400).json(data);
    }

    return catchError({ res, err });
  }
}
