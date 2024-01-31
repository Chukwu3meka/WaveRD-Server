import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import validate from "../../utils/validate";
import { Request, Response } from "express";
import { PROFILE } from "../../models/accounts";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    const { id: tempId, session } = req.body.auth;

    console.log({ tempId, session });

    if (!tempId) throw { message: "Session ID is Invalid" };
    if (!session) throw { message: "Session ID is Invalid" };

    const id = new ObjectId(tempId);
    if (!isValidObjectId(id)) throw { message: "Session ID is invalid" };

    validate({ type: "comment", value: id }); // <= Validate request body before processing request
    const profile = await PROFILE.findOne({ _id: id, ["auth.session"]: session });

    if (!profile) throw { message: "Can't find associated profile", sendsendError: true };
    if (profile.status !== "active") throw { message: "Account not active", sendsendError: true };

    const { role, name, handle, theme } = profile;

    const data = { success: true, message: `Profile details retrieved successfully`, data: { theme, role, name, handle } };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
