import { Request, Response } from "express";

import validate from "../../utils/validate";
import { PROFILE } from "../../models/accounts";
import { CONTACT_US } from "../../models/console";
import { catchError, requestHasBody } from "../../utils/handlers";

import pushMail from "../../utils/pushMail";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "handle", "comment", "password"] });
    const { email, handle, comment, password, auth } = req.body;

    // Validate request body before processing request
    validate({ type: "email", value: email });
    validate({ type: "handle", value: handle });
    validate({ type: "comment", value: comment });
    validate({ type: "password", value: password });

    const profile: any = await PROFILE.findOne({ _id: auth.id, email });
    if (!profile || !profile.auth) throw { message: "Invalid Email/Password", sendsendError: true };
    if (profile.auth.deletion) throw { message: "Data deletion already initiated", sendsendError: true };

    const matchPassword = await PROFILE.comparePassword(password, profile.auth?.password);
    if (!matchPassword) throw { message: "Invalid Email/Password", sendsendError: true };

    if (handle !== profile.handle) throw { message: "Invalid Email/Password", sendsendError: true };

    await PROFILE.findOneAndUpdate(auth.id, { $set: { ["auth.deletion"]: new Date() } });

    await CONTACT_US.create({ category: "Data Deletion", comment, email });

    await pushMail({
      address: email,
      account: "accounts",
      template: "dataDeletion",
      subject: "SoccerMASS - Data Deletion",
      data: { name: profile.name },
    });

    const data = { success: true, message: `Data deletion initiated`, data: null };

    res.status(201).json(data);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
