import { NextFunction, Request, Response } from "express";

export const serverHomePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.writeHead(200);

    res.writeHead(200);
    res.send("authors");
    res.send("authors");
    res.end("authors");

    return res.status(200).json("masses");
  } catch (err) {
    // return catchError({ next, err, message: "unable to locate masses" });
  }
};
