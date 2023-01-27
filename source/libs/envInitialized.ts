const envKeys = [
  //  Passport
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "TWITTER_CONSUMER_KEY",
  "TWITTER_CONSUMER_SECRET",
  // App
  "SECRET",
  "MONGODB_URI",

  "CLIENT_DOMAIN",
  "SERVER_DOMAIN",
  "CLIENT_BASE_URL",
  "SERVER_BASE_URL",

  // "EMAIL_PASS",
  // "EMAIL_ADDR",
  // "PORT",
  // "OTP",
  // "SALARY_CAP",
  // "MAX_BUDGET",
  // "MAX_SQUAD",
  // "MIN_SQUAD",
];

export default () => {
  for (const key of envKeys) {
    if (!process.env[key]) throw { message: `${key} is missing` };
  }
};
