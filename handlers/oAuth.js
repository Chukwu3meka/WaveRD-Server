const jwt = require("jsonwebtoken");
const Profile = require("../models/profile");
const { validate } = require("../source/library/validator");
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
    const { handle, session, club, soccermass, division, stat } = profile;
    const { verified, reputation } = stat;

    if (verified === "verified") {
      const manager = { handle, club, soccermass, division, session, reputation };
      const token = jwt.sign(manager, process.env.SECRET, { expiresIn: "30 days" });
      return res.redirect(`${process.env.CLIENT}auth/signin?token=${token}`);
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
