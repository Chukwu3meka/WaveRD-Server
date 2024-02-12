import { v4 as uuid } from "uuid";
import { ObjectId } from "mongoose";

import { FAILED_REQUESTS } from "../models/console";
import { CatchError } from "../interface/utils-handlers-interface";

export const catchError = async ({ res, req, err }: CatchError) => {
  const { request = null, ...data } = res.req.body,
    { sendError = false, status = 400, message = null, respond = true } = err || [];

  if (message !== "invalid endpoint") {
    // handle api calls rejected by requests middleware
    await FAILED_REQUESTS.create({ error: err, data, request });
  }

  if (<string>process.env.NODE_ENV === "development") {
    console.log(request ? `${request.endpoint} <<<>>> ${JSON.stringify(message).replaceAll('"', "")}` : `${res.req.url} <<<>>> Invalid route`);
  }

  console.log({ sendError });

  if (respond) res.status(status).json({ success: false, message: sendError ? message : "Unable to process request", data: null });
};

export const sleep = async (seconds: number) => {
  const duration = seconds * 60 * 60;
  return new Promise((resolve) => setTimeout(resolve, duration));
};

export const requestHasBody = ({ body, required, sendError = false }: { body: { [key: string]: any }; required: string[]; sendError?: boolean }) => {
  // console.log({ body, required });

  for (const x of required) {
    if (body[x] === undefined) throw { message: `${x} is not defined`, sendError };
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

// res.writeHead(302, { Location: process.env.API_URL }).end();
// export const redirectToWeb = (req: Request, res: Response) => res.redirect(302, `${process.env.API_URL}`);

// function to generate the date for n  days from now:
interface IcalcFutureDate {
  context: "days" | "hours";
  interval: number;
}

export const calcFutureDate = ({ interval, context }: IcalcFutureDate): Date => {
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
export const hourDiff = (date1: Date, date2?: Date) => {
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

export const generateSession = (id: ObjectId) => {
  const randOne = Date.now(),
    randDate = Date.now() + Date.now(),
    randTwo = String(range(111111, 999999)),
    randStart = String(range(1111111, 9999999)),
    randStop = String(range(1111111111, 9999999999)),
    randUuid = `${uuid()}-${uuid()}-${uuid()}-${uuid()}-${uuid()}`;

  return `${randOne}-${uuid()}-${randUuid}-${randTwo}-${id}-${randStart}-${randDate}-${randStop}`;
};

export const getIdFromSession = (session: string) => {
  const subSessions = session.split("-");
  const id = subSessions[subSessions.length - 4];

  return id;
};

export const capitalize = (word: string) => word && word[0].toUpperCase() + word.slice(1);

// export const haltOnTimedout = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.timedout) next();
// };
