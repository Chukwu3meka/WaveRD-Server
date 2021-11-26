const jwt = require("jsonwebtoken");
const Profile = require("../models/profile");
const bcrypt = require("bcryptjs");
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const validate = require("../source/library/validator").validate;
const pushMail = require("../utils/pushMail").pushMail;

const { sessionGenerator, catchError, validateRequestBody, obfuscate } = require("../utils/serverFunctions");

const { v4 } = require("uuid");
const { clubModel, Mass } = require("../models/handler");
const { clubStore } = require("../source/database/clubStore");
const emailTemplates = require("../utils/emailTemplates").emailTemplates;

exports.signup = async (req, res, next) => {
  try {
    const { mass, division, club, handle, password, dob, email, gender } = validateRequestBody(req.body, [
      "mass",
      "division",
      "club",
      "handle",
      "password",
      "dob",
      "email",
      "gender",
    ]);

    let conditionMet = [mass, division, club, handle, password, dob, email, gender].every((x) => x);
    if (!conditionMet) throw "incomplete parameter passed";

    const Clubs = clubModel(mass);
    const clubData = await Clubs.findOne({ ref: club });

    // check if club is vaild
    if (!clubData) throw "invalid club";
    // check if club already has a manager
    if (clubData.manager) throw "club is already managed";

    // check if email is taken alread
    const emailTaken = await Profile.findOne({ email });
    if (emailTaken) throw "email taken";

    // @(club,${club},title) where title is get method of club
    const news = {
      title: `${clubStore(club).title} has a new manager`,
      content: `@(club,${club},title) has appointed ${handle} as General Manager and Head Coach, following a convincing and engaging search by @(club,${club},nickname) President and Technical staff, ${handle} will take the hot sit of @(club,${club},title), though inexperienced only time will tell how long ${
        gender === "male" ? "he" : "she"
      } can keep ${gender === "male" ? "his" : "her"} job`,
      image: `club/${club}.webp`,
    };

    const event = `${handle} was presented as @(club,${club},title) Head coach and General manager. After an extensive and tiring search`;

    const report = {
      title: `First training session with @(club,${club},nickname) first team players`,
      content: `Head coach ${handle}, has just completed his first training session with @(club,${club},title) senior squad, it was an intense exercise as the new manager gets ready to dip his feet into the sea, his next meeting will be with his technical staff and his assistant, before moving on to youth squad.`,
      image: `club/${club}.webp`,
    };

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "invalid mass";

    await Mass.updateOne(
      { ref: mass },
      {
        $set: { [`unmanaged.${division}`]: massData.unmanaged[division] - 1, "unmanages.total": massData.unmanaged.total - 1 },
        $push: { news: { $each: [news], $slice: -10 } },
      }
    );

    await Clubs.updateOne(
      { ref: club },
      {
        $set: { manager: handle },
        $push: {
          "history.events": { event },
          "history.managers": { manager: handle, departure: null },
          reports: { $each: [report], $slice: -10 },
        },
      }
    );

    const session = sessionGenerator();

    await Profile.create({
      mass,
      division,
      club,
      email,
      password,
      session,
      handle,
      stat: { dob, gender },
      clubsManaged: [{ club }],
    })
      .then(async ({ _id, stat: { registered } }) => {
        const signupReference = sessionGenerator(_id),
          serverStamp = new Date(registered).getTime();

        await Profile.updateOne({ email }, { session, "stat.verified": signupReference });

        await pushMail({
          emailAddress: email,
          emailSubject: "SoccerMASS Account Verification",
          emailBody: emailTemplates("accountVerification", { handle, signupReference, serverStamp }),
        });
        // console.log(`${process.env.CLIENT}auth/verify?signupReference=${signupReference}&serverStamp=${serverStamp}&handle=${handle}`);

        return res.status(201).json("success");
      })
      .catch((err) => {
        throw `Profile creation err: ${err}`;
      });
  } catch (err) {
    return catchError({ res, next, err, message: "signup failed" });
  }
};

exports.verifyAccount = async (req, res, next) => {
  try {
    const { handle, signupReference, serverStamp } = validateRequestBody(req.body, ["handle", "signupReference", "serverStamp"]);

    const profile = await Profile.findOne({ handle, "stat.verified": signupReference });
    if (!profile) throw "Profile does not exist";

    if (new Date(profile.stat.registered).getTime() !== serverStamp) throw "Link has been modified";

    await Profile.updateOne({ handle, "stat.verified": signupReference }, { "stat.verified": "verified" });

    return res.status(200).send("verified");
  } catch (err) {
    return catchError({ next, res, err, message: "invalid or expired link." });
  }
};

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = validateRequestBody(req.body, ["email", "password"]);

    const profile = await Profile.findOne({ email });

    const validCredentials = await profile.comparePassword(password);
    if (!validCredentials) throw "invalid credentials";

    const {
      club,
      mass,
      handle,
      session,
      division,
      stat: { verified: signupReference, registered },
    } = profile;
    const manager = { handle, club, mass, division, session };

    console.log({ handle, club, mass, division, session });

    if (signupReference === "verified") {
      const token = jwt.sign(manager, process.env.SECRET, { expiresIn: "90 days" });
      return res.status(200).json({ token });
    } else {
      const serverStamp = new Date(registered).getTime();

      await pushMail({
        emailAddress: email,
        emailSubject: "SoccerMASS Account Verification",
        emailBody: emailTemplates("accountVerification", { handle, signupReference, serverStamp }),
      });

      // console.log(`${process.env.CLIENT}auth/verify?signupReference=${signupReference}&serverStamp=${serverStamp}&handle=${handle}`);

      throw "email not verified";
    }
  } catch (err) {
    return catchError({ res, next, err, message: err === "email not verified" ? "email not verified" : "invalid credentials" });
  }
};

exports.resetPasswordOTPSender = async (req, res, next) => {
  try {
    const { handle, email, password } = validateRequestBody(req.body, ["handle", "email", "password"]);

    const profile = await Profile.findOne({ email, handle });
    if (!profile) throw "profile does not exist";

    const otp = Math.floor(1000000 + Math.random() * 9000000);
    const hashedPassword = await profile.hashPassword(password);

    // add a day
    const exp = new Date();
    exp.setHours(exp.getHours() + 3);

    await Profile.updateOne(
      { email, handle },
      {
        "stat.otp": {
          exp,
          code: otp,
          data: hashedPassword,
          status: "password reset",
        },
      }
    );

    await pushMail({
      emailAddress: email,
      emailSubject: "SoccerMASS: OTP for Password reset",
      emailBody: emailTemplates("resetPassword", { handle, email, otp }),
    });

    res.status(200).json({ resetToken: obfuscate(otp) });
  } catch (err) {
    return catchError({ next, res, err, message: "Password reset failed" });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, handle, otp } = validateRequestBody(req.body, ["handle", "email", "otp"]);

    const profile = await Profile.findOne({ email, handle });

    if (!profile) throw "profile does not exist";
    if (profile.stat.otp.code !== Number(otp)) throw "wrong otp provided";
    if (!profile.stat.otp.status) throw "otp has been used";
    if (!profile.stat.otp.data) throw "new password not saved";
    if (new Date().getTime() > profile.stat.otp.exp) throw "otp has expired";

    const session = sessionGenerator(profile._id);
    await Profile.updateOne(
      { email },
      {
        session,
        password: profile.stat.otp.data,
        "stat.otp": { status: null, exp: null, code: null, data: null },
      }
    );

    await pushMail({
      emailAddress: email,
      emailBody: emailTemplates("resetPasswordSuccess", { handle }),
      emailSubject: "SoccerMASS: Password reset Successfully",
    });

    res.status(200).json("Password rest successful");
  } catch (err) {
    return catchError({ next, res, err, message: "Password reset failed" });
  }
};

exports.emailTaken = async (req, res, next) => {
  try {
    let { email } = req.body;
    email = validate("email", email);
    let result = await Profile.findOne({ email });
    result = result ? "email taken" : "email is available";
    res.status(200).send(result);
  } catch (err) {
    return catchError({ res, next, err, message: "search failed" });
  }
};

// exports.persistUser = async (req, res, next) => {};
exports.starter = async (req, res, next) => {
  try {
    const { mass, club, division } = validateRequestBody(req.body, ["mass", "club", "division"]);

    const massData = await Mass.findOne({ ref: mass });
    const Clubs = clubModel(mass);
    const clubData = await Clubs.findOne({ ref: club });
    if (!clubData) throw "Club not found";
    console.log(homeCal, clubData.history.lastFiveMatches);

    res.status(200).json("hey");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

// exports.portfolio = async (req, res, next) => {
//   try {
//     const { handle, club, soccermass } = req.body;
//     const profile = await Profile.findOne({ handle, club, soccermass });
//     const { mom, moy } = profile.award;
//     const { reputation, season } = profile.stat;
//     return res.status(200).send({ reputation, season, mom, moy });
//   } catch (err) {
//     return catchError({ res, next, err, message: "" });
//   }
// };
// exports.managers = async (req, res, next) => {
//   try {
//     const { soccermass } = req.body;
//     const result = await Profile.find({ soccermass });
//     const smManagers = [];
//     result.forEach((i) => {
//       smManagers.push({
//         handle: i.handle,
//         reputation: i.stat.reputation,
//         club: i.club,
//         registered: i.stat.registered,
//         division: i.division,
//       });
//     });
//     res.status(200).send(smManagers);
//   } catch (err) {
//     return catchError({ res, next, err, message: "" });
//   }
// };
// exports.updateSettings = async (req, res, next) => {
//   try {
//     const { handle } = req.body;
//     const key = Object.keys(req.body)[1];
//     if (key === "password") {
//       const value = req.body[key];
//       const hashed = await bcrypt.hash(value, 10);
//       await Manager.updateOne({ handle }, { [key]: hashed });
//       return res.status(200).send(`${key} update was succesfull`);
//     } else if (key === "email") {
//       const value = req.body[key];
//       await Manager.updateOne({ handle }, { [key]: value });
//       return res.status(200).send(`${key} update was succesfull`);
//     } else {
//       const value = req.body[key];
//       await Manager.updateOne({ handle }, { handle: value });
//       fs.rename(
//         `C:/wamp64/www/soccermass/client/src/images/Handle/${handle}.jpg`,
//         `C:/wamp64/www/soccermass/client/src/images/Handle/${value}.jpg`,
//         (err) => {
//           if (err) throw err;
//         }
//       );
//       return res.status(200).send(`handle update was succesfull`);
//     }
//   } catch (err) {
//     return catchError({ res, next, err, message: "" });
//   }
// };
