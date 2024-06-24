import validate from "../../utils/validate";

import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import { Request, Response } from "express";
import { ENDPOINTS } from "../../models/apihub";
import { catchError, requestHasBody } from "../../utils/handlers";
import { PROFILE as ACCOUNTS_PROFILE } from "../../models/accounts";
import { PROFILE as GAMES_PROFILE } from "../../models/games";
import { getProfileHandler } from "../accounts";

export default async (req: Request, res: Response) => {
  try {
    const { id: tempId, session } = req.body.auth;

    const profile = getProfileHandler(tempId, session);
    if (!profile) throw { message: "Profile not found", sendError: true };

    const id = new ObjectId(tempId),
      gameProfile = await GAMES_PROFILE.findByIdAndUpdate(id);

    if (!gameProfile) throw { message: "Games Profile not found", sendError: true };

    const data = { success: true, message: `Profile details retrieved successfully`, data: gameProfile };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
