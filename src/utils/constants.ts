import { CookieOptions } from "express";
import { calcFutureDate } from "./handlers";

export const cookiesOption: CookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "strict",
  expires: calcFutureDate({ context: "days", interval: 180 }),
  secure: process.env.NODE_ENV === "production" ? true : false,
  domain: process.env.NODE_ENV === "production" ? ".soccermass.com" : "localhost",
};

export const themes = ["dark", "light"];

export const contactPreferences = ["email", "whatsapp"];
