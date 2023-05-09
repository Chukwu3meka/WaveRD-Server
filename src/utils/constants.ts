import { CookieOptions } from "express";
import { calcFutureDate } from "./handlers";

export const cookiesOption: CookieOptions = {
  path: "/",
  sameSite: "strict",
  httpOnly: true,
  expires: calcFutureDate({ context: "days", interval: 180 }),
  secure: process.env.NODE_ENV === "production" ? true : false,
  domain: process.env.NODE_ENV === "production" ? "soccermass.com" : "localhost",
};
