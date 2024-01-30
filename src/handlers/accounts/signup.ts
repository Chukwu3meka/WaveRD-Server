import { Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import validate from "../../utils/validator";
import { emailExistsFn } from "./emailExists";
import { handleExistsFn } from "./handleExists";
import { PROFILE } from "../../models/accounts";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "name", "handle"] });
    const { email, password, name, handle } = req.body;

    // Validate request body before processing request
    validate({ type: "email", value: email });
    validate({ type: "handle", value: handle });
    validate({ type: "name", value: name });
    validate({ type: "password", value: password });

    // ? check if email is taken alread
    const emailTaken = await emailExistsFn(email);
    if (emailTaken) throw { message: "Email already in use, Kindly use a different email address", error: true };

    // ? check if handle is taken alread
    const handleTaken = await handleExistsFn(handle);
    if (handleTaken) throw { message: "Handle already in use, Kindly use a different handle", error: true };

    return await PROFILE.create({ email, handle, name, "auth.password": password })
      .then(async (dbResponse: any) => {
        const emailPayload = {
          name,
          handle,
          activationLink: `${process.env.API_URL}/v1/accounts/verify-email?gear=${dbResponse.auth.otp.code}`,
        };

        await pushMail({ account: "accounts", template: "welcome", address: email, subject: "Welcome to SoccerMASS", data: emailPayload });

        const data = { success: true, message: "Account created successfully", data: null };

        return res.status(201).json(data);
      })
      .catch(({ message }) => {
        throw { message: message || `Profile creation was unsuccessful`, client: !process.env.NODE_ENV };
      });
  } catch (err: any) {
    return catchError({ res, err });
  }
};
