import cors from "cors";
import hub from "./hub/index";
import accounts from "./accounts/index";

import { redirectToWeb } from "../utils/handlers";
import { Application, Express } from "express";

// export default (app: Application) => {
//   // cors({ preflightContinue: true });
//   console.log("dsfdsfds");

//   // ?  Redirect calls to Server Homepage
//   app.all("/", redirectToWeb);
//   app.all("/api", redirectToWeb);
//   app.all("/accounts", redirectToWeb);
//   app.all("/hub", redirectToWeb);

//   app.use("*", (s, q, next) => {
//     console.log("Dfdsfd");
//     // next();
//   });

//   // accounts(app); //  <= App-API Request
//   hub(app); //  <= API Hub Request
// };

import personalAccounts from "./accounts/personal";

const corsOptions = {
  // origin: [/(?:[a-zA-Z0-9]+\.)*localhost:3000/, /(?:[a-zA-Z0-9]+\.)*soccermass/, /(?:[a-zA-Z0-9]+\.)*10\.128\.32\.176:3000/],
  //   origin: [/(?:[a-zA-Z0-9]+\.)*localhost:3000/, /(?:[a-zA-Z0-9]+\.)*soccermass/, /(?:[a-zA-Z0-9]+\.)*10\.128\.32\.176:3000/],
  origin: [
    // ? SoccerMASS Development Web
    "http://localhost:3000",
    "http://apihub.localhost:3000",
    "http://manager.localhost:3000",
    // "http://accounts.localhost:3000",

    // ? SoccerMASS Production
    // "https://soccermass.com",
    "https://www.soccermass.com",
    "https://dev.soccermass.com",
    "https://apihub.soccermass.com",
    "https://manager.soccermass.com",
  ],
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  // "Access-Control-Allow-Methods"
  // allowedOrigins,
  methods: ["GET, POST, PUT, DELETE, OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  // if (origin === "http://localhost:3000" || origin === "https://www.soccermass.com") {
  //   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  //   res.header("Access-Control-Allow-Credentials", "true"); // If credentials are required
  //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //   res.header("Access-Control-Allow-Origin", origin); // Replace with the appropriate origin
  // }
};

export default (app: Application) => {
  app.use(
    "/api/accounts/personal/",
    // () => {
    //   console.log("sadsa");
    // },
    cors(corsOptions),
    // routes.personalAccounts
    personalAccounts
  );
};
