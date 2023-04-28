export const accounts = {
  origin: [
    // ? SoccerMASS Development Web
    "http://localhost:3000",
    "http://apihub.localhost:3000",
    "http://manager.localhost:3000",
    // ? SoccerMASS Production
    "https://www.soccermass.com",
    "https://dev.soccermass.com",
    "https://apihub.soccermass.com",
    "https://manager.soccermass.com",
  ],
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ["GET, POST, PUT, DELETE, OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
};
