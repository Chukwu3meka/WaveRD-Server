const jwt = require("jsonwebtoken");
const Profiles = require("../models/profiles");

module.exports = (req, res, next) => {
  if (req.headers["authorization"] && req.headers["authorization"].split(" ")[0] === "Bearer") {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        res.json("Failed to authenticate token");
      } else {
        req.decoded = decoded;
        const { session } = req.body;
        const profile = await Profiles.findOne({ session });
        if (profile) return next();
        res.json("Failed to authenticate token");
      }
    });
  } else {
    res.status(403).json("No token provided");
  }
};
