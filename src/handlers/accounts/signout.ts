import { Request, Response } from "express";

import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    const protocol = process.env.NODE_ENV === "production" ? "https://" : "http://";
    return res.status(200).clearCookie("session").clearCookie("session.sig").clearCookie("SSID").redirect(`${protocol}${process.env.CLIENT_DOMAIN}/`);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
