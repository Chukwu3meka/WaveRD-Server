import { Request, Response } from "express";

import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    console.log(req.body.request);

    return res.clearCookie("session").clearCookie("session.sig").clearCookie("SSID").redirect(302, `${process.env.CLIENT_DOMAIN}`);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
