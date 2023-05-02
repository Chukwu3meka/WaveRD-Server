import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { PROFILE } from "../../models/accounts";
import { catchError, differenceInHour, nTimeFromNowFn, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password"] });
    const { email, password: authPassword } = req.body;

    const profile = await PROFILE.findOne({ email });
    if (!profile) throw { message: "Invalid Email/Password", client: true }; // <= verify that account exist, else throw an error

    console.log({ profile });

    // const {
    //   id,
    //   otp,
    //   role,
    //   status,
    //   fullName,
    //   handle,
    //   loginAttempts,
    //   stat: {
    //     email: { verified: emailVerified },
    //     cookie: { consent: cookieConsent },
    //   },
    //   auth: { locked, password },
    // } = profile;

    // if (status !== "active")
    //   throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation", client: true };

    // const matchPassword = await PROFILE.comparePassword(authPassword, password);

    // if (!matchPassword) {
    //   console.log({ loginAttempts });
    //   console.log("Explicit");
    // const currentFailedAttempts = failedAttempts + 1;
    // if (currentFailedAttempts > 1 && currentFailedAttempts < 7)
    //   await pushMail({ account: "accounts", template: "failedLogin", address: email, subject: "Failed Login Attempt - SoccerMASS", payload: { fullName } });

    // if (currentFailedAttempts === 7) {
    //   await pushMail({ account: "accounts", template: "lockNotice", address: email, subject: "Account Lock Notice - SoccerMASS", payload: { fullName } });
    //   throw { client: true, message: "Email/Password is Valid " };
    // }

    // const lastAttemptDiff = differenceInHour(lastAttempt);

    // console.log(lastAttemptDiff);
    // if (lastAttemptDiff < 1) {
    //   await PROFILE.findByIdAndUpdate({ id }, { $inc: { ["auth.failedAttempts"]: 1 }, $set: { locked: new Date() } });
    // }

    // if (currentFailedAttempts < 7) {
    //   await PROFILE.findByIdAndUpdate({ id }, { $inc: { "auth.failedAttempts": 1 }, $set: { locked: new Date() } });
    // } else {
    //   await PROFILE.findByIdAndUpdate({ id }, { $inc: { "auth.failedAttempts": 1 } });
    // }

    //   throw { message: "Invalid Email/Password", client: true };
    // }

    //   await Club(mass).updateOne(
    //     { ref: club },
    //     {
    //       $inc: {
    //         budget: Math.floor(
    //           ((700 * clubStore(club).capacity) / 13.7 / 1000000) * (myGoal > oppGoal ? 2.3 : myGoal === oppGoal ? 1.5 : 0.5)
    //         ),
    //         "history.match.won": myGoal > oppGoal ? 1 : 0,
    //         "history.match.lost": myGoal === oppGoal ? 1 : 0,
    //         "history.match.tie": oppGoal > myGoal ? 1 : 0,
    //         "history.match.goalFor": myGoal,
    //         "history.match.goalAgainst": oppGoal,
    //       },
    //       $push: {
    //         "history.lastFiveMatches": {
    //           $each: [myGoal > oppGoal ? "win" : myGoal === oppGoal ? "tie" : "lost"],
    //           $slice: -5,
    //         },
    //         reports: {
    //           $each: [
    //             {
    //               title: "Match Result",
    //               content: `Our match against
    //               @(club,${opponent},title) has ended, and we ${
    //                 myGoal > oppGoal ? "won" : myGoal === oppGoal ? "drew" : "lost"
    //               } the match by ${homeScore} goals to ${awayScore}`,
    //               image: `/club/${opponent}.webp`,
    //             },
    //           ],
    //           $slice: -15,
    //         },
    //       },
    //       $set: {
    //         lastMatch: {
    //           away,
    //           home,
    //           hg: homeScore,
    //           ag: awayScore,
    //           date: Date.now(),
    //           ...matchStat,
    //         },
    //       },
    //     }
    //   );
    // };

    // if (locked) {
    //   const lockDuration = differenceInHour(locked) <= 3; // ? <= check if account has been locked for 3 hours
    //   if (lockDuration) throw { message: "Account is temporarily locked, Please try again later" };

    //   await PROFILE.findByIdAndUpdate({ id }, { $set: { ["auth.locked"]: null } });
    // }

    // if (failedAttempts) await PROFILE.findByIdAndUpdate({ id }, { $set: { ["auth.failedAttempts"]: 0 } });

    // if (!emailVerified) {
    //   const lastSent = differenceInHour(otp.sent);

    //   if (lastSent > 3) {
    //     const newOTP = {
    //       sent: new Date(),
    //       purpose: "email verification",
    //       code: `${uuid()}-${uuid()}-${uuid()}`,
    //       expiry: nTimeFromNowFn({ context: "hours", interval: 3 }),
    //     };

    //     await PROFILE.findByIdAndUpdate({ id }, { $set: { otp: newOTP } });

    //     await pushMail({
    //       account: "accounts",
    //       template: "reVerifyEmail",
    //       address: email,
    //       subject: "Verify Your Email to Keep Your SoccerMASS Account Active",
    //       payload: { activationLink: `https://www.soccermass.com/auth/verify-email?registration-id=${newOTP.code}`, fullName },
    //     });

    //     throw { message: "To access our services, kindly check your inbox for the most recent verification email from us", client: true };
    //   }

    //   throw {
    //     message: `Kindly check your inbox for our latest verification email that was sent ${lastSent < 1 ? "less than an hour" : "few hours"} ago`,
    //     client: true,
    //   };
    // }

    // const session = `${id}@${uuid()}-${uuid()}-${uuid()}`;

    // await PROFILE.findByIdAndUpdate({ id }, { $set: { lastLogin: new Date() } });
    // await pushMail({ account: "accounts", template: "successfulLogin", address: email, subject: "Successful Login to SoccerMASS", payload: { fullName } });

    // this.auth.sessions[0]
    // console.log({ session });

    // const sidToken = jwt.sign({ session }, process.env.SECRET as string, { expiresIn: "120 days" });
    // const userToken = jwt.sign({ role, fullName, handle, id: id }, process.env.SECRET as string, { expiresIn: "120 days" });

    // const data = { success: true, message: "Email/Password is Valid.", payload: { role, fullName, handle, cookieConsent } };

    // const cookiesOption = {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production" ? true : false,
    //   // domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
    //   // domain: '.soccermass.com',
    //   expires: nTimeFromNowFn({ context: "days", interval: 120 }),
    // };

    // res.status(200).cookie("SID", sidToken, cookiesOption).cookie("user", userToken, cookiesOption).json(data);
    res.status(200).json("data");
  } catch (err: any) {
    return catchError({ res, err });
  }
};
