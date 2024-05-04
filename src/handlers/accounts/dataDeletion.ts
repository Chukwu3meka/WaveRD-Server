import { Request, Response } from "express";

import validate from "../../utils/validate";
import { PROFILE } from "../../models/accounts";
import { CONTACT_US } from "../../models/info";
import { catchError, preventProfileBruteForce, requestHasBody } from "../../utils/handlers";

import pushMail from "../../utils/pushMail";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "handle", "comment", "password"] });
    const { email, handle, comment, password, auth } = req.body;

    // Validate request body before processing request
    validate({ type: "email", value: email });
    validate({ type: "handle", value: handle });
    validate({ type: "password", value: password });
    if (comment) validate({ type: "comment", value: comment });

    const profile = await PROFILE.findById(auth.id);
    if (!profile) throw { message: "User Profile does not exists", sendError: true };
    if (profile.email !== email) throw { message: "Profile mismatch", sendError: true };

    await preventProfileBruteForce({ password, profile });

    if (profile.auth?.deletion) throw { message: "Data deletion already initiated", sendError: true };

    await PROFILE.findOneAndUpdate(auth.id, { $set: { ["auth.deletion"]: new Date() } });
    await CONTACT_US.create({ category: "Data Deletion", comment: comment || "", email });

    await pushMail({
      address: email,
      account: "accounts",
      template: "dataDeletion",
      data: { name: profile.name },
      subject: "SoccerMASS - Data Deletion",
    });

    const data = { success: true, message: `Data deletion initiated`, data: null };

    res.status(201).json(data);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
