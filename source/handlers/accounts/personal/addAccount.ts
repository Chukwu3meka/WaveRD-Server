import { NextFunction, Request, Response } from "express";

import { emailExistsFn } from "./emailExists";
import pushMail from "../../../utils/pushMail";
import { PROFILE, SESSION } from "../../../models/accounts";
import { catchError, requestHasBody } from "../../../utils/handlers";
// import { FAILED_REQUESTS } from "../../../models/logs";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "fullName", "handle"] });
    const { email, password, fullName, handle } = req.body;

    // ? check if email is taken alread
    const emailTaken = await emailExistsFn(email);
    if (emailTaken) throw { message: "Email already in use, Kindly use a different email address" };

    return await PROFILE.create({ email, handle, fullName })
      .then(() =>
        SESSION.create({ email, password })
          .then(async (dbResponse: any) => {
            const emailPayload = {
              fullName,
              handle,
              activationLink: `${process.env.CLIENT_BASE_URL}/auth/verify-email?registration-id=${dbResponse.otp.code}`,
            };

            throw { message: "Deleted profile due to failed Session creation" };
            await pushMail({ account: "accounts", template: "welcome", address: dbResponse.email, subject: "Welcome to SoccerMASS", payload: emailPayload });

            const data = { success: true, message: "Account created successfully", payload: null };

            return res.status(201).json(data);
          })
          .catch(async () => {
            // delete profile/possibly session if session not created
            await PROFILE.deleteOne({ email, handle, fullName });
            await SESSION.deleteOne({ email });

            throw { message: "Deleted profile due to failed Session creation" };
          })
      )
      .catch(({ message }) => {
        throw { message: message || `Profile creation was unsuccessful` };
      });
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
