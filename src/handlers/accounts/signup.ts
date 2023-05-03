import { Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { emailExistsFn } from "./emailExists";
import { PROFILE } from "../../models/accounts";
import { handleExistsFn } from "./handleExists";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "fullName", "handle"] });
    const { email, password, fullName, handle } = req.body;

    // ? check if email is taken alread
    const emailTaken = await emailExistsFn(email);
    if (emailTaken) throw { message: "Email already in use, Kindly use a different email address", client: true };

    // ? check if handle is taken alread
    const handleTaken = await handleExistsFn(handle);
    if (handleTaken) throw { message: "Handle already in use, Kindly use a different handle", client: true };

    return await PROFILE.create({ email, handle, fullName, "auth.password": password })
      .then(async (dbResponse: any) => {
        const emailPayload = {
          fullName,
          handle,
          activationLink: `${process.env.PROTOCOL}${process.env.CLIENT_DOMAIN}/accounts/verify-email?registration-id=${dbResponse.auth.otp.code}`,
        };

        await pushMail({ account: "accounts", template: "welcome", address: email, subject: "Welcome to SoccerMASS", payload: emailPayload });

        const data = { success: true, message: "Account created successfully", payload: null };

        return res.status(201).json(data);
      })
      .catch(({ message }) => {
        throw { message: message || `Profile creation was unsuccessful`, client: !process.env.NODE_ENV };
      });
  } catch (err: any) {
    return catchError({ res, err });
  }
};
