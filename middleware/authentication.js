const jwt = require("jsonwebtoken");
const Profile = require("../models/profile");

module.exports = (req, res, next) => {
  if (req.headers["authorization"] && req.headers["authorization"].split(" ")[0] === "Bearer") {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        res.json("suspicious token");
      } else {
        req.decoded = decoded;
        const { session } = req.body;
        const profile = await Profile.findOne({ session });
        if (profile) return next();
        res.json("suspicious token");
      }
    });
  } else {
    res.status(403).json("No token provided");
  }
};
