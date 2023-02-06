import { NextFunction, Request, Response } from "express";

import { appModels } from "../../../models";
import { emailExistsFn } from "./emailTaken";
import { catchError, requestHasBody, sleep } from "../../../utils/handlers";

const SESSION = appModels.appSessionModel;
const USERS = appModels.appUserModel;

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "fullName", "handle"] });
    const { email, password, fullName, handle } = req.body;

    console.log({ email, password, fullName, handle });
    // const { acc } = req.query;

    // ? check if email is taken alread
    const emailTaken = await emailExistsFn(email);
    if (emailTaken) throw { message: "Email already in use, Kindly use a different email address" };

    // const session = sessionGenerator();

    return await USERS.create({ email, handle, fullName })
      .then(() => {
        SESSION.create({
          email,
          password,
        })
          .then(() => {
            // await pushMail({
            //   emailAddress: email,
            //   emailSubject: "SoccerMASS Account Verification",
            //   emailBody: emailTemplates("accountVerification", { handle, signupReference, serverStamp }),
            // });

            // fullName, handle, activationLink

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
