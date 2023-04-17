import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

module.exports = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers["authorization"] && req.headers["authorization"].split(" ")[0] === "Bearer") {
    const token = req.headers["authorization"].split(" ")[1];

    const secret = process.env.SECRET;
    if (!secret) throw { errMsg: "ENV Secret undefined" };

    jwt.verify(token, secret, async (err, decoded: any) => {
      if (err) {
        res.status(401).json("suspicious token");
      } else {
        const { session, club, mass } = decoded;
        req.body = { club, mass, ...req.body };
        if (session && mass && club) return next();
        res.status(401).json("suspicious token");
      }
    });
  } else {
    res.status(401).json("No token provided");
  }
};
