// catch err in return
module.exports.catchError = ({ res, err, status = 400, message = "Internal Server Error" }) => {
  if (process.env.NODE_ENV !== "production") console.log(`${res.req.originalUrl}: ${err}`);
  res.status(status).json(message);
};

module.exports.validateRequestBody = (body, arr) => {
  const validate = require("./validator").validate;
  const newBody = {};

  // validate all required param
  for (const key of arr) {
    if (
      validate(
        key === "password"
          ? "password"
          : key === "handle"
          ? "handle"
          : key === "email"
          ? "email"
          : key === "serverStamp"
          ? "number"
          : ["list"].includes(key)
          ? "boolean"
          : ["squad", "roles"].includes(key)
          ? "textArray"
          : ["age", "value", "rating"].includes(key)
          ? "numberArray"
          : ["dob", "date"].includes(key)
          ? "date"
          : "text",
        body[key]
      ) === undefined
    ) {
      throw `${key} parameter not validataed`;
    }

    newBody[key] = ["serverStamp"].includes(key) ? Number(body[key]) : body[key];
  }

  return { ...newBody };
};

// get random value between two numbers
module.exports.range = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// make values in an array unique
module.exports.uniqueArray = (arr) => arr.filter((value, index, self) => self.indexOf(value) === index);

//to shuffle array
module.exports.shuffleArray = (array = []) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 3));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// get players and club ref
module.exports.getRef = (refType, ref) => {
  switch (refType) {
    case "club":
      return `club${`${ref}`.padStart(6, "0")}`;
    case "player":
      return `player${`${ref}`.padStart(9, "0")}`;
    case "sm":
      return `sm${`${ref}`.padStart(9, "0")}`;
    default:
      return undefined;
  }
};

// display portions of mail
module.exports.asterickMail = (mail) => {
  const emailServerDomain = mail.split("@")[1],
    emailUserName = mail.split("@")[0].substr(0, 3);

  return `${emailUserName}***${emailServerDomain}`;
};

module.exports.obfuscate = (s, c) => {
  s = `${s}`;
  c = c || 0x7f;
  let r = "";
  for (i in s) {
    valh = (s.charCodeAt(i) ^ c).toString(16);
    if (valh.length == 1) valh = "0" + valh;
    r += valh;
  }
  return r;
};

module.exports.sessionGenerator = (id, length = 36) => {
  const { v4 } = require("uuid");

  let session = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    session += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return id ? `${session}-${id}-${v4()}` : `${session}-${v4()}`;
};

module.exports.arrayToChunks = (arr, size) => {
  const arrChunks = [],
    newArr = [...arr];

  while (newArr.length) {
    arrChunks.push(newArr.splice(0, size));
  }

  return arrChunks;
};

module.exports.numToText = (no) => {
  switch (no) {
    case 1:
      return "One";
    case 2:
      return "Two";
    case 3:
      return "Three";
    case 4:
      return "Four";
    case 5:
      return "Five";
    case 6:
      return "Six";
    case 7:
      return "Seven";
    case 8:
      return "Eight";
    default:
      return null;
  }
};

module.exports.sortArr = (arr, sortKey, asc = true) => {
  if (sortKey === "date") {
    asc ? arr.sort((x, y) => new Date(x.date) - new Date(y.date)) : arr.sort((x, y) => new Date(y.date) - new Date(x.date));
  } else {
    arr.sort((x, y) => {
      if (x[sortKey] > y[sortKey]) return asc ? 1 : -1;
      if (x[sortKey] < y[sortKey]) return asc ? -1 : 1;
    });
  }

  return arr;
};
