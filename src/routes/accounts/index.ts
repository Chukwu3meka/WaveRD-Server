import cors from "cors";

import personal from "./personal";

const allowedOrigins = [
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
];

const corsOptions = {
  // origin: [/(?:[a-zA-Z0-9]+\.)*localhost:3000/, /(?:[a-zA-Z0-9]+\.)*soccermass/, /(?:[a-zA-Z0-9]+\.)*10\.128\.32\.176:3000/],
  //   origin: [/(?:[a-zA-Z0-9]+\.)*localhost:3000/, /(?:[a-zA-Z0-9]+\.)*soccermass/, /(?:[a-zA-Z0-9]+\.)*10\.128\.32\.176:3000/],
  origin: allowedOrigins,
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

export default (app: any) => {
  // ? App-API Request to Personal
  app.use("/api/personal", personal);

  // app.use("/api/accounts/personal", personal);
  // app.use("/api/accounts/personal", cors(corsOptions), personal);
};
