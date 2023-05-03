import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
import { FAILED_REQUESTS } from "../models/logs";

import { CatchError } from "../interface/utils-handlers-interface";
import { ObjectId } from "mongoose";

export const catchError = async ({ res, err }: CatchError) => {
  const client = err.client || false,
    endpoint = res.req.originalUrl,
    message = err.message || err,
    status = err.status || 400,
    payload = res.req.body;

  if (<string>process.env.NODE_ENV === "development") console.error(`${res.req.originalUrl} <<<>>> ${JSON.stringify(message)}`);

  await FAILED_REQUESTS.create({ endpoint, message, err, payload });

  res.status(status).json({ success: false, message: client ? message : "Unable to process request", payload: null });
};

export const sleep = async (seconds: number) => {
  const duration = seconds * 60 * 60;
  return new Promise((resolve) => setTimeout(resolve, duration));
};

export const requestHasBody = ({ body, required }: { body: { [key: string]: any }; required: string[] }) => {
  // console.log({ body, required });

  for (const x of required) {
    if (body[x] === undefined) throw { message: `${x} is not defined` };
  }

  // const validate = require("./validator").validate;
  // const newBody = {};

  // // validate all required param
  // for (const key of required) {
  //   if (
  //     validate(
  //       key === "password"
  //         ? "password"
  //         : key === "handle"
  //         ? "handle"
  //         : key === "email"
  //         ? "email"
  //         : "date" === key
  //         ? "date"
  //         : ["serverStamp", "fee"].includes(key)
  //         ? "number"
  //         : ["list", "target"].includes(key)
  //         ? "boolean"
  //         : ["squad", "roles"].includes(key)
  //         ? "textArray"
  //         : ["age", "value", "rating"].includes(key)
  //         ? "numberArray"
  //         : "text",
  //       body[key]
  //     ) === undefined
  //   ) {
  //     throw `${key} parameter not validataed`;
  //   }

  //   newBody[key] = ["serverStamp", "fee"].includes(key) ? Number(body[key]) : body[key];
  // }

  // return { ...newBody };
};

export const redirectToWeb = (req: Request, res: Response) => res.writeHead(302, { Location: "https://soccermass.com" }).end();

// function to generate the date for n  days from now:
interface INTimeFromNowFn {
  context: "days" | "hours";
  interval: number;
}
export const nTimeFromNowFn = ({ interval, context }: INTimeFromNowFn): Date => {
  const currentTime = new Date();

  switch (context) {
    case "days":
      const futureDate = new Date();
      futureDate.setDate(currentTime.getDate() + interval);
      return futureDate;
    case "hours":
      return new Date(currentTime.getTime() + interval * 60 * 60 * 1000);
    default:
      return new Date();
  }
};

// difference in hours between date
export const differenceInHour = (date: Date) => {
  const diff = Math.round((new Date().valueOf() - new Date(date).valueOf()) / (1000 * 60 * 60));
  return diff;
};

// difference in hours between date
export const obfuscate = (phrase: string) => {
  let r = "";
  for (let i of phrase.split("").keys()) {
    let valh = (phrase.charCodeAt(i) ^ 0x7f).toString(16);
    if (valh.length == 1) valh = "0" + valh;
    r += valh;
  }
  return r;
};

export const range = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateSession = (id: ObjectId) => `${uuid()}-${uuid()}-${Date.now()}-${uuid()}-${uuid()}-${id}-${String(range(0, 999999999)).padStart(9, "0")}`;

export const generateOtp = (id: ObjectId) => `${Date.now()}-${uuid()}-${id}-${String(range(0, 999999999)).padStart(9, "0")}`;

export const capitalize = (word: string) => word && word[0].toUpperCase() + word.slice(1);
