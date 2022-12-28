import { NextFunction, Request, Response } from "express";
import { catchError } from "../utils/serverFunctions";

export const playersInClub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { club } = req.params;
    const {} = req.body;

    return res.status(200).json(`"masses", ${club}`);
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

// res.writeHead(200);

// res.writeHead(200);
// res.send("authors");
// res.send("authors");
// res.end("authors");

// return res.status(200).json("masses");
