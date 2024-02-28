import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import validate from "../../utils/validate";
import { Request, Response } from "express";
import { PROFILE } from "../../models/accounts";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    const { id: tempId, session } = req.body.auth;

    if (!tempId) throw { message: "Session ID is Invalid" };
    if (!session) throw { message: "Session ID is Invalid" };

    // // const id = new ObjectId(tempId);

    const id = new ObjectId(tempId);
    if (!isValidObjectId(id)) throw { message: "Session ID is invalid" };

    validate({ type: "comment", value: tempId }); // <= Validate request body before processing request
    const profile = await PROFILE.findById(id);

    if (!profile) throw { message: "Can't find associated profile", sendError: true };
    if (profile.auth?.session !== session) throw { message: "Can't find associated profile", sendError: true };
    if (profile.status !== "active") throw { message: "Account not active", sendError: true };

    await PROFILE.findByIdAndUpdate(id, { ["auth.inactivity"]: new Date() });

    const { role, name, handle, theme, avatar } = profile;
    const data = { success: true, message: `Profile details retrieved successfully`, data: { theme, role, name, handle, avatar } };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
