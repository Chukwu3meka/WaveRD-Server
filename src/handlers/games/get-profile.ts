import validate from "../../utils/validate";

import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import { Request, Response } from "express";
import { ENDPOINTS } from "../../models/apihub";
import { catchError, requestHasBody } from "../../utils/handlers";
import { PROFILE as ACCOUNTS_PROFILE } from "../../models/accounts";
import { PROFILE as GAMES_PROFILE } from "../../models/games";

export default async (req: Request, res: Response) => {
  try {
    if (!req.body.auth) throw { message: "User not signed in", sendError: true };

    const { id: tempId, session } = req.body.auth;

    if (!tempId) throw { message: "Invalid Session ID", sendError: true };
    if (!session) throw { message: "Invalid Session ID", sendError: true };

    const id = new ObjectId(tempId);
    if (!isValidObjectId(id)) throw { message: "Invalid Session ID", sendError: true };

    validate({ type: "comment", value: tempId }); // <= Validate request body before processing request
    const profile = await ACCOUNTS_PROFILE.findById(id);

    if (!profile) throw { message: "Can't find associated profile", sendError: true };
    if (profile.auth?.session !== session) throw { message: "Can't find associated profile", sendError: true };
    if (profile.status !== "active") throw { message: "Account not active", sendError: true };

    await ACCOUNTS_PROFILE.findByIdAndUpdate(id, { ["auth.inactivity"]: new Date() });

    const gameProfile = await GAMES_PROFILE.findByIdAndUpdate(id);

    const { role, name, handle, theme, avatar } = profile;

    const data = { success: true, message: `Profile details retrieved successfully`, data: gameProfile };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
