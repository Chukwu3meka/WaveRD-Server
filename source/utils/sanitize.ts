interface ISanitizeMaps {
  "&": string;
  "<": string;
  ">": string;
  '"': string;
  "'": string;
  "/": string;
}

const sanitizeMaps: ISanitizeMaps = {
  "&": "&amp",
  "<": "&lt",
  ">": "&gt",
  '"': "&quot",
  "'": "&#x27",
  "/": "&#x2F",
};

type ISanitizeMapss = "&" | "<" | ">" | '"' | "'" | "/";

export default (value: string): string => {
  const sanitizeRegEx = /[&<>"'/"]/gi;
  // return value.replace(sanitizeRegEx, (match) => sanitizeMaps && sanitizeMaps?.[match]);
  return value.replace(sanitizeRegEx, (match: string) => sanitizeMaps && sanitizeMaps?.[match]);
};
