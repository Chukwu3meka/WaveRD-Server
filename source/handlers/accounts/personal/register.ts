import { NextFunction, Request, Response } from "express";

import { accountsModel } from "../../../utils/models";
import { emailExistsFn } from "./emailTaken";
import pushMail from "../../../utils/pushMail";
import { catchError, requestHasBody } from "../../../utils/handlers";

const SESSION = accountsModel.personalSessionModel;
const PROFILE = accountsModel.personalProfileModel;

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "fullName", "handle"] });
    const { email, password, fullName, handle } = req.body;

    // ? check if email is taken alread
    const emailTaken = await emailExistsFn(email);
    if (emailTaken) throw { message: "Email already in use, Kindly use a different email address" };

    return await PROFILE.create({ email, handle, fullName })
      .then(() => {
        SESSION.create({ email, password })
          .then(async (dbResponse: any) => {
            const emailPayload = {
              fullName,
              handle,
              activationLink: `${process.env.CLIENT_BASE_URL}/auth/verify-email?registration-id=${dbResponse.otp.code}`,
            };

            await pushMail({ account: "accounts", template: "welcome", address: dbResponse.email, subject: "Welcome to SoccerMASS", payload: emailPayload });

            const data = { success: true, message: "Account created successfully", payload: null };

            return res.status(201).json(data);
          })
          .catch(() => {
            // delete profile
            throw { message: `delete Profile ` };
          });
      })
      .catch(() => {
        throw { message: `Profile creation was unsuccessful` };
      });

    //     const data = { success: true, message: null, payload: { email } };
    //   })
    //   .catch((err) => {
    //   });
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
