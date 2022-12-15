import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";

// require("dotenv").config(); // enable reading from .env file
// require("./models"); // enable app access database
// require("./task"); // run task

// const passport = require("./middleware/oAuth");
const PORT = process.env.PORT || 5000;
// const secret = process.env.SECRET;

// const app = require("express")();
const app = express();

app.use(cors());

// const routes = require("./routes");
const server = require("http").Server(app);
// const io = (module.exports.io = require("socket.io")(server));

// const socketManager = require("./handlers/socketManager");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
// app.use(cookieSession({ secret:, resave: true, saveUninitialized: true }));

// app.use(passport.initialize());
// app.use(passport.session());

app.use("/api/club", function (req, res) {
  res.setHeader("Content-Type", "application/json");
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
