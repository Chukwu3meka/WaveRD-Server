import { NextFunction, Request, Response } from "express";

import { emailExistsFn } from "./emailExists";
import { handleExistsFn } from "./handleExists";
import pushMail from "../../../utils/pushMail";
import { PROFILE, SESSION } from "../../../models/accounts";
import { catchError, requestHasBody } from "../../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "fullName", "handle"] });
    const { email: sensitiveEmail, password, fullName, handle } = req.body;

    const email: string = sensitiveEmail.toLowerCase(); // <= to ensure emails are unique

    // ? check if email is taken alread
    const emailTaken = await emailExistsFn(email);
    if (emailTaken) throw { message: "Email already in use, Kindly use a different email address" };

    // ? check if handle is taken alread
    const handleTaken = await handleExistsFn(handle);
    if (handleTaken) throw { message: "Handle already in use, Kindly use a different handle" };

    return await PROFILE.create({ email, handle, fullName })
      .then(() =>
        SESSION.create({ email, password })
          .then(async (dbResponse: any) => {
            const emailPayload = {
              fullName,
              handle,
              activationLink: `https://soccermass.com/auth/verify-email?registration-id=${dbResponse.otp.code}`,
            };

            await pushMail({ account: "accounts", template: "welcome", address: email, subject: "Welcome to SoccerMASS", payload: emailPayload });

            const data = { success: true, message: "Account created successfully", payload: null };

            return res.status(201).json(data);
          })
          .catch(async (err) => {
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
