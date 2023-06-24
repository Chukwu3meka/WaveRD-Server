import { Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { CONTACT_US } from "../../models/console";
import { catchError, requestHasBody } from "../../utils/handlers";

import pushMail from "../../utils/pushMail";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "handle", "comment", "password"] });
    const { email, handle, comment, password, auth } = req.body;

    const profile: any = await PROFILE.findOne({ _id: auth.id, email });
    if (!profile || !profile.auth) throw { message: "Invalid Email/Password", error: true };
    if (profile.auth.deletion) throw { message: "Data deletion already initiated", error: true };

    const matchPassword = await PROFILE.comparePassword(password, profile.auth?.password);
    if (!matchPassword) throw { message: "Invalid Email/Password", error: true };

    if (handle !== profile.handle) throw { message: "Invalid Email/Password", error: true };

    await PROFILE.findOneAndUpdate(auth.id, { $set: { ["auth.deletion"]: new Date() } });

    await CONTACT_US.create({ category: "Data Deletion", comment, email });

    await pushMail({
      address: email,
      account: "accounts",
      template: "dataDeletion",
      subject: "SoccerMASS - Data Deletion",
      payload: { fullName: profile.fullName },
    });

    const data = { success: true, message: `Data deletion initiated`, payload: null };

    res.status(201).json(data);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
