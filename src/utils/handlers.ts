import { v4 as uuid } from "uuid";
import { ObjectId } from "mongoose";
import { Request, Response } from "express";

import { FAILED_REQUESTS } from "../models/logs";
import { CatchError } from "../interface/utils-handlers-interface";

export const catchError = async ({ res, err }: CatchError) => {
  const { request = null, ...payload } = res.req.body,
    { client = false, status = 400, message = null, respond = true } = err || [];

  // // handle api calls rejected by requests middleware
  if (message !== "invalid endpoint") await FAILED_REQUESTS.create({ error: err, payload, request });

  if (<string>process.env.NODE_ENV === "development")
    console.error(request ? `${request.endpoint} <<<>>> ${JSON.stringify(message).replaceAll('"', "")}` : `${res.req.url} <<<>>> Invalid route`);
  if (respond) res.status(status).json({ success: false, message: client ? message : "Unable to process request", payload: null });
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

// res.writeHead(302, { Location: process.env.CLIENT_DOMAIN }).end();
export const redirectToWeb = (req: Request, res: Response) => res.redirect(302, `${process.env.CLIENT_DOMAIN}`);

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
export const differenceInHour = (date1: Date, date2?: Date) => {
  let diff;

  if (date1 && date2) {
    diff = Math.round((new Date(date1).valueOf() - new Date(date2).valueOf()) / (1000 * 60 * 60));
  } else {
    diff = Math.round((new Date().valueOf() - new Date(date1).valueOf()) / (1000 * 60 * 60));
  }

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

export const generateSession = (id: ObjectId) =>
  `${Date.now()}-${uuid()}-${uuid()}-${uuid()}-${Date.now()}-${uuid()}-${uuid()}-${uuid()}-${Date.now()}-${id}-${String(range(0, 999999999)).padStart(9, "0")}`;

export const getIdFromSession = (session: string) => {
  const subSessions = session.split("-");
  const id = subSessions[subSessions.length - 2];
  return id;
};

export const capitalize = (word: string) => word && word[0].toUpperCase() + word.slice(1);
