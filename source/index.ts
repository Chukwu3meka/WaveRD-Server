import cors from "cors";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
// import passport from "./middleware/oAuth";

dotenv.config(); // enable reading from .env file
// require("./models"); // enable app access database
// require("./task"); // run task

const PORT = process.env.PORT || 5000;
const secret = process.env.SECRET;

const app = express();

app.use(cors());

// const routes = require("./routes");
const server = require("http").Server(app);
// const io = (module.exports.io = require("socket.io")(server));

// const socketManager = require("./handlers/socketManager");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "7mb" }));
// app.use(cookieSession({ secret, resave: true, saveUninitialized: true }));
app.use(cookieSession({ secret }));

// app.use(passport.initialize());
// app.use(passport.session());

// if homepage is invoked, redirect user to SoccerMASS Web
app.use("/", (req: Request, res: Response) => res.redirect(301, "https://www.soccermass.com/"));
app.use("/v1", (req: Request, res: Response) => res.redirect(301, "https://www.soccermass.com/"));
app.use("/api", (req: Request, res: Response) => res.redirect(301, "https://www.soccermass.com/"));

app.use("/api/club", function (req: Request, res: Response) {
  // res.setHeader("Content-Type", "application/json");
  switch (req.url) {
    case "/":
      res.writeHead(200);
      res.end("books");
      break;
    case "/authors":
      res.writeHead(200);
      res.end("authors");
      break;
  }
});

// app.use("/club/", routes.Club);
// app.use("/mass/", routes.Mass);
// app.use("/auth/", routes.oAuth);ff
// app.use("/trend/", routes.Trend);
// app.use("/admin/", routes.Admin);
// app.use("/player/", routes.Player);
// app.use("/profile/", routes.Profile);

// io.on("connection", socketManager);

server.listen(PORT, () => console.log(`SoccerMASS:::listening on port ${PORT}`));
