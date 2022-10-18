const maps = {
  "&": "&amp",
  "<": "&lt",
  ">": "&gt",
  '"': "&quot",
  "'": "&#x27",
  "/": "&#x2F",
};
const sanitize = (value) => {
  const sanitizeReg = /[&<>"'/"]/gi;
  const sanitized = value.replace(sanitizeReg, (match) => maps[match]);
  return sanitized;
};

module.exports.validate = (valueType, value) => {
  if (!["boolean", "textArray", "numberArray", "roles", "number"].includes(valueType)) value = value && value.trim();
  // console.log(valueType, value);
  switch (valueType) {
    case "boolean": {
      return value === true || value === false ? value : undefined;
    }
    case "email": {
      value = value.toLowerCase();
      const reg =
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
      const regStatus = reg.test(value) && value.length > 7 && value.length < 30;
      return regStatus ? value : undefined;
    }
    case "password": {
      const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~`!@#$%^&*()_+-=|/ ]{7,30}$/;
      const regStatus = reg.test(value);
      return regStatus ? value : undefined;
    }
    case "text": {
      const reg = /^(?!.*\.\.)(?!.*\.$)[^\W][\w\s\-]{2,200}$/gim;
      const regStatus = reg.test(value);
      return regStatus ? value : undefined;
    }
    case "number": {
      const reg = /^\s*[+-]?(\d+|\.\d+|\d+\.\d+|\d+\.)(e[+-]?\d+)?\s*$/;
      const regStatus = reg.test(value);
      return regStatus ? value : undefined;
    }
    case "handle": {
      const reg = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.\s@!~#^$*']{2,39}$/gim;
      const regStatus = reg.test(value);
      return regStatus ? value : undefined;
    }
    case "string": {
      const newValue = value;
      const reg = /^(?!.*\.\.)(?!.*\.$)[^\W][\w\W]{2,999}$/gim;
      let status = reg.test(newValue) && newValue.length > 0;
      if (status === true) return newValue;
      return false;
    }
    case "date": {
      value = value !== null ? value : "error";
      const newValue = new Date(value);
      const status = newValue instanceof Date && !isNaN(newValue);
      if (status === true) {
        const newDateYear = newValue.getFullYear();
        const currentYear = new Date().getFullYear();
        const yearDiff = currentYear - newDateYear;
        if (yearDiff > 12 && yearDiff < 121) return newValue;
      }
      return false;
    }
    case "textArray": {
      const reg = /^(?!.*\.\.)(?!.*\.$)[^\W][\w\s\-]{0,200}$/gim;

      const textArray = [];

      for (const text of value) return reg.test(text) ? textArray.push(value) : undefined;

      return textArray.length ? textArray : undefined;
    }
    case "numberArray": {
      const reg = /^\s*[+-]?(\d+|\.\d+|\d+\.\d+|\d+\.)(e[+-]?\d+)?\s*$/;

      const numberArray = [];
      for (const number of value) return reg.test(number) ? numberArray.push(value) : undefined;

      return numberArray.length ? numberArray : undefined;
    }

    default:
      return false;
  }
};
