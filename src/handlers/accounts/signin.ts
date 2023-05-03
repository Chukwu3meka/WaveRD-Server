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
    if (!profile || !profile.auth || !profile.auth.verification || !profile.auth.failedAttempts) throw { message: "Invalid Email/Password", client: true }; // <= verify that account exist, else throw an error

    const {
      _id,
      role,
      handle,
      fullName,
      cookieConsent,
      status: accountStatus,
      auth: {
        otp,
        locked,
        password,
        verification: { email: emailVerified },
        failedAttempts: { counter, lastAttempt },
      },
    } = profile;

    if (accountStatus !== "active")
      throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation", client: true };

    const matchPassword = await PROFILE.comparePassword(authPassword, password);

    if (!matchPassword) {
      const failedAttempts = counter + 1,
        hoursElapsed = differenceInHour(lastAttempt);

      // Notify user on Login Attempt
      if ([5, 6].includes(failedAttempts))
        await pushMail({ account: "accounts", template: "failedLogin", address: email, subject: "Failed Login Attempt - SoccerMASS", payload: { fullName } });

      if (failedAttempts === 7) {
        await pushMail({ account: "accounts", template: "lockNotice", address: email, subject: "Account Lock Notice - SoccerMASS", payload: { fullName } });
      }

      // Increment record on Database
      if (failedAttempts >= 7 && hoursElapsed < 1) {
        await PROFILE.findByIdAndUpdate(
          { _id },
          { $inc: { "auth.failedAttempts.counter": 1 }, $set: { "auth.locked": new Date(), "auth.failedAttempts.lastAttempt": new Date() } }
        );
      } else {
        await PROFILE.findByIdAndUpdate({ _id }, { $inc: { "auth.failedAttempts.counter": 1 }, $set: { "auth.failedAttempts.lastAttempt": new Date() } });
      }

      throw { message: "Invalid Email/Password", client: true };
    }

    // reset locked, atytempts
    console.log({ matchPassword, counter });

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

    //   await PROFILE.findByIdAndUpdate({ _id }, { $set: { ["auth.locked"]: null } });
    // }

    // if (failedAttempts) await PROFILE.findByIdAndUpdate({ _id }, { $set: { ["auth.failedAttempts.counter"]: 0 } });

    // if (!emailVerified) {
    //   const lastSent = differenceInHour(otp.sent);

    //   if (lastSent > 3) {
    //     const newOTP = {
    //       sent: new Date(),
    //       purpose: "email verification",
    //       code: `${uuid()}-${uuid()}-${uuid()}`,
    //       expiry: nTimeFromNowFn({ context: "hours", interval: 3 }),
    //     };

    //     await PROFILE.findByIdAndUpdate({ _id }, { $set: { otp: newOTP } });

    //     await pushMail({
    //       account: "accounts",
    //       template: "reVerifyEmail",
    //       address: email,
    //       subject: "Verify Your Email to Keep Your SoccerMASS Account Active",
    //       payload: { activationLink: `https://www.soccermass.com/auth/verify-email?registration-_id=${newOTP.code}`, fullName },
    //     });

    //     throw { message: "To access our services, kindly check your inbox for the most recent verification email from us", client: true };
    //   }

    //   throw {
    //     message: `Kindly check your inbox for our latest verification email that was sent ${lastSent < 1 ? "less than an hour" : "few hours"} ago`,
    //     client: true,
    //   };
    // }

    // const session = `${_id}@${uuid()}-${uuid()}-${uuid()}`;

    // await PROFILE.findByIdAndUpdate({ _id }, { $set: { lastLogin: new Date() } });
    // await pushMail({ account: "accounts", template: "successfulLogin", address: email, subject: "Successful Login to SoccerMASS", payload: { fullName } });

    // this.auth.sessions[0]
    // console.log({ session });

    // const sidToken = jwt.sign({ session }, process.env.SECRET as string, { expiresIn: "120 days" });
    // const userToken = jwt.sign({ role, fullName, handle, _id: _id }, process.env.SECRET as string, { expiresIn: "120 days" });

    // const data = { success: true, message: "Email/Password is Valid.", payload: { role, fullName, handle, cookieConsent } };

    // const cookiesOption = {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production" ? true : false,
    //   // domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
    //   // domain: '.soccermass.com',
    //   expires: nTimeFromNowFn({ context: "days", interval: 120 }),
    // };

    // res.status(200).cookie("SID", sidToken, cookiesOption).cookie("user", userToken, cookiesOption).json(data);

    console.log("dsfdsf");
    res.status(200).json("data");
  } catch (err: any) {
    return catchError({ res, err });
  }
};
