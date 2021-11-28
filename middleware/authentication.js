const jwt = require("jsonwebtoken");
// const Profile = require("../models/profile");

module.exports = (req, res, next) => {
  if (req.headers["authorization"] && req.headers["authorization"].split(" ")[0] === "Bearer") {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        res.status(401).json("suspicious token");
      } else {
        req.decoded = decoded;
        const { session, club, mass } = req.body;
        if (session && club && mass) return next();
        res.status(401).json("suspicious token");

        // const { session } = req.body;
        // const profile = await Profile.findOne({ session });
        // if (profile) return next();
        // res.status(401).json("suspicious token");
      }
    });
  } else {
    res.status(401).json("No token provided");
  }
};
