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
  switch (valueType) {
    case "email": {
      const newValue = value.toLowerCase();
      const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
      let status = reg.test(newValue) && newValue.length > 7;
      if (status === true) return newValue;
      return false;
    }
    case "password": {
      const newValue = value;
      const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~`!@#$%^&*()_+-=|/ ]{7,}$/;
      let status = reg.test(newValue);
      if (status === true) return newValue;
      return false;
    }
    case "text": {
      const newValue = value;
      const reg = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.\s\-']{2,39}$/gim;
      let status = reg.test(newValue) && newValue.length > 0;
      if (status === true) return newValue;
      return false;
    }
    case "longText": {
      const newValue = value;
      const reg = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.\s\-']{2,200}$/gim;
      let status = reg.test(newValue) && newValue.length > 0;
      if (status === true) return newValue;
      return false;
    }
    case "number": {
      const newValue = value;
      const reg = /^[\d]*$/;
      let status = reg.test(newValue) && newValue.length > 0;
      if (status === true) return newValue;
      return false;
    }
    case "handle": {
      const newValue = value;
      const reg = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.\s@!~#^$*']{2,39}$/gim;
      let status = reg.test(newValue) && newValue.length > 0;
      if (status === true) return newValue;
      return false;
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
    default:
      return false;
  }
};
