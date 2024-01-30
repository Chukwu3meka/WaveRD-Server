import { CookieOptions } from "express";
import { calcFutureDate } from "./handlers";

// const PORT = process.env.PORT || 5000;
const PROD_ENV = process.env.NODE_ENV === "production";

export const clientCookiesOption: CookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: PROD_ENV ? true : false,
  domain: PROD_ENV ? ".soccermass.com" : `.localhost`,
  // domain: PROD_ENV ? ".soccermass.com" : `localhost`,
  // domain: PROD_ENV ? ".soccermass.com" : `localhost:${PORT}`,
  expires: calcFutureDate({ context: "days", interval: 180 }),
};

export const themes = ["dark", "light"];

export const contactPreferences = ["email", "whatsapp"];
