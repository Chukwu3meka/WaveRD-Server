import { NextFunction, Request, Response } from "express";

export const serverHomePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const response = await Mass.find({});
    // const masses = [];

    // for (const { ref, created, unmanaged, season } of Object.values(response)) {
    //   masses.push({ ref, unmanaged, created, season, sponsor: massStore(ref) });
    // }
    return res.status(200).json("masses");
  } catch (err) {
    // return catchError({ next, err, message: "unable to locate masses" });
  }
};
