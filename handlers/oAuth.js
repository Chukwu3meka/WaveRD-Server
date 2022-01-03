const jwt = require("jsonwebtoken");
const Profile = require("../models/profile");
const { validate } = require("../utils/validator");
const { obfuscate, asterickMail } = require("../utils/serverFunctions");

const catchErr = ({ res, req, err }) => {
  if (process.env.NODE_ENV !== "production") console.log(err);

  const email = validate("email", req.user);
  return res.redirect(`${process.env.CLIENT}auth/signin?token=failed&rstd=${obfuscate(email)}`);
};

const oAuthFunc = async (req, res) => {
  const email = validate("email", req.user);
  if (email) {
    const profile = await Profile.findOne({ email });
    if (!profile) throw "Profile not found";

    const {
      club,
      mass,
      handle,
      division,
      session,
      stat: { verified },
    } = profile;

    if (verified === "verified") {
      const token = jwt.sign({ session, mass, club }, process.env.SECRET, { expiresIn: "90 days" }),
        clientToken = jwt.sign({ token, handle, division, mass, club }, process.env.SECRET, { expiresIn: "90 days" });
      return res.redirect(`${process.env.CLIENT}auth/signin?token=${clientToken}`);
    } else {
      return res.redirect(`${process.env.CLIENT}auth/signin?token=verify&email=${asterickMail(email)}`);
    }
  }
  return catchErr({ err: "mail missing", res, req });
};

exports.facebookAuth = async (req, res, next) => {
  try {
    await oAuthFunc(req, res);
  } catch (err) {
    return catchErr({ err, res, req });
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    await oAuthFunc(req, res);
  } catch (err) {
    return catchErr({ err, res, req });
  }
};
exports.twitterAuth = async (req, res, next) => {
  try {
    await oAuthFunc(req, res);
  } catch (err) {
    return catchErr({ err, res, req });
  }
};
