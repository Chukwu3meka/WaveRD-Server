import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { FAILED_REQUESTS } from "../models/logs";

interface ICatchError {
  res: Response;
  err: any;
  status?: number;
  message?: string;
  redirect?: boolean;
  redirectObject?: any;
}

export const catchError = async ({ res, err, status = 400, message = "Unable to process request", redirect = false }: ICatchError) => {
  if (process.env.NODE_ENV !== "production")
    console.log(`ERROR @ ${res.req.originalUrl}
Plain >>> ${err}
:::_:::_:::               :::_:::_:::
JSON >>> ${JSON.stringify(err)}`);

  await FAILED_REQUESTS.create({ endpoint: res.req.originalUrl, message, payload: JSON.stringify(err) });

  if (redirect) {
    res.redirect("http://localhost:3000/auth/signin");

    // return  res.send({name : "StackOverFlow", reason : "Need help!", redirect_path: "/user/me"});

    const role = "sadssa",
      fullName = "sadsadsa",
      handle = "SAdsadsadsa";

    const token = jwt.sign({ session: "SAdsadsadsads", role, fullName, handle }, process.env.SECRET as string, { expiresIn: "120 days" });

    const data = { success: true, message: "Email/Password is Valid.", payload: {} };

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.production ? true : false,
      // domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
      expires: nTimeFromNowFn({ context: "days", interval: 120 }),
    };

    res.status(200).cookie("222SoccerMASS", token, cookiesOption).json(data);
  }

  //   redirectObject;

  // return res.status(status).json({ success: false, message, payload: null });

  return res.status(status).json({ success: false, message, payload: null });
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
