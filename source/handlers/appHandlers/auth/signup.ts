import { NextFunction, Request, Response } from "express";
import { catchError, requestHasBody, sleep } from "../../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "fullName", "handle"] });
    const { email, password, fullName, handle } = req.body;

    console.log({ email, password, fullName, handle });
    // const { acc } = req.query;

    // const account = (acc as string).replaceAll('"', "");
    // console.log(typeof account);

    // // check if email is taken alread

    // const emailTaken = await Profile.findOne({ email });
    // if (emailTaken) throw "email taken";

    // const session = sessionGenerator();

    // await Profile.create({
    //   mass,
    //   division,
    //   club,
    //   email,
    //   password,
    //   session,
    //   handle,
    //   stat: { registered: dateRegistered },
    //   clubsManaged: [{ club }],
    // })
    //   .then(async ({ _id, stat: { registered } }) => {
    //     const signupReference = sessionGenerator(_id),
    //       serverStamp = new Date(registered).getTime();

    //     await Profile.updateOne({ email }, { session, "stat.verified": signupReference });

    //     await pushMail({
    //       emailAddress: email,
    //       emailSubject: "SoccerMASS Account Verification",
    //       emailBody: emailTemplates("accountVerification", { handle, signupReference, serverStamp }),
    //     });
    //     // console.log(`${process.env.CLIENT}auth/verify?signupReference=${signupReference}&serverStamp=${serverStamp}&handle=${handle}`);

    //     return res.status(201).json("success");
    //   })
    //   .catch((err) => {
    //     throw `Profile creation err: ${err}`;
    //   });

    return res.status(200).json("successfull signin");
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
