import cors from "cors";

import personal from "./personal";

const allowedOrigins = [
  // ? SoccerMASS Development Web
  "http://localhost:3000",
  "http://apihub.localhost:3000",
  "http://manager.localhost:3000",
  "http://accounts.localhost:3000",

  // ? SoccerMASS Production
  "https://soccermass.com",
  "https://www.soccermass.com",
  "https://dev.soccermass.com",
  "https://apihub.soccermass.com",
  "https://manager.soccermass.com",
];

const corsOptions = {
  // origin: [/(?:[a-zA-Z0-9]+\.)*localhost:3000/, /(?:[a-zA-Z0-9]+\.)*soccermass/, /(?:[a-zA-Z0-9]+\.)*10\.128\.32\.176:3000/],
  //   origin: [/(?:[a-zA-Z0-9]+\.)*localhost:3000/, /(?:[a-zA-Z0-9]+\.)*soccermass/, /(?:[a-zA-Z0-9]+\.)*10\.128\.32\.176:3000/],
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default (app: any) => {
  // ? App-API Request to Personal
  // app.use("/api/accounts/personal", personal);
  app.use("/api/personal", cors(corsOptions), personal);
  // app.use("/api/accounts/personal", cors(corsOptions), personal);
};
