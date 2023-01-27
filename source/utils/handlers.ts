import { Response } from "express";

interface ICatchError {
  res: Response;
  err: any;
  status?: number;
  message?: string;
}

export const catchError = ({ res, err, status = 400, message = "Unable to process request" }: ICatchError) => {
  if (process.env.NODE_ENV !== "production") console.log(`${res.req.originalUrl}: ${JSON.stringify(err)}`);

  return res.status(status).json({ status: "error", message, payload: null });
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
// export const validateRequestBody = (body, arr) => {
//   const validate = require("./validator").validate;
//   const newBody = {};

//   // validate all required param
//   for (const key of arr) {
//     if (
//       validate(
//         key === "password"
//           ? "password"
//           : key === "handle"
//           ? "handle"
//           : key === "email"
//           ? "email"
//           : "date" === key
//           ? "date"
//           : ["serverStamp", "fee"].includes(key)
//           ? "number"
//           : ["list", "target"].includes(key)
//           ? "boolean"
//           : ["squad", "roles"].includes(key)
//           ? "textArray"
//           : ["age", "value", "rating"].includes(key)
//           ? "numberArray"
//           : "text",
//         body[key]
//       ) === undefined
//     ) {
//       throw `${key} parameter not validataed`;
//     }

//     newBody[key] = ["serverStamp", "fee"].includes(key) ? Number(body[key]) : body[key];
//   }

//   return { ...newBody };
// };

// // get random value between two numbers
// export const range = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// // make values in an array unique
// export const uniqueArray = (arr) => {
//   return arr.filter((value, index, self) => self.indexOf(value) === index);
// };

// //to shuffle array
// export const shuffleArray = (arr = []) => {
//   const newArr = [...arr];
//   for (let i = newArr.length - 1; i > 0; i--) {
//     let j = Math.floor(Math.random() * (i + 3));
//     [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
//   }
//   return newArr;
// };

// // get players and club ref
// export const getRef = (refType, ref) => {
//   switch (refType) {
//     case "club":
//       return `club${`${ref}`.padStart(6, "0")}`;
//     case "player":
//       return `player${`${ref}`.padStart(9, "0")}`;
//     case "sm":
//       return `sm${`${ref}`.padStart(9, "0")}`;
//     default:
//       return undefined;
//   }
// };

// // display portions of mail
// export const asterickMail = (mail) => {
//   const emailServerDomain = mail.split("@")[1],
//     emailUserName = mail.split("@")[0].substr(0, 3);

//   return `${emailUserName}***${emailServerDomain}`;
// };

// export const obfuscate = (s, c) => {
//   s = `${s}`;
//   c = c || 0x7f;
//   let r = "";
//   for (i in s) {
//     valh = (s.charCodeAt(i) ^ c).toString(16);
//     if (valh.length == 1) valh = "0" + valh;
//     r += valh;
//   }
//   return r;
// };

// export const sessionGenerator = (id, length = 36) => {
//   const { v4 } = require("uuid");

//   let session = "";
//   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   const charactersLength = characters.length;

//   for (let i = 0; i < length; i++) {
//     session += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }

//   return id ? `${session}-${id}-${v4()}` : `${session}-${v4()}`;
// };

// export const arrayToChunks = (arr, size) => {
//   const arrChunks = [],
//     newArr = Array.from(arr);

//   while (newArr.length) {
//     arrChunks.push(newArr.splice(0, size));
//   }

//   return arrChunks;
// };

// export const numToText = (no) => {
//   switch (no) {
//     case 1:
//       return "One";
//     case 2:
//       return "Two";
//     case 3:
//       return "Three";
//     case 4:
//       return "Four";
//     case 5:
//       return "Five";
//     case 6:
//       return "Six";
//     case 7:
//       return "Seven";
//     case 8:
//       return "Eight";
//     default:
//       return null;
//   }
// };
