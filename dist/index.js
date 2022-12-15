"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
// require("dotenv").config(); // enable reading from .env file
// require("./models"); // enable app access database
// require("./task"); // run task
// const passport = require("./middleware/oAuth");
const PORT = process.env.PORT || 5000;
// const secret = process.env.SECRET;
// const app = require("express")();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// const routes = require("./routes");
const server = require("http").Server(app);
// const io = (module.exports.io = require("socket.io")(server));
// const socketManager = require("./handlers/socketManager");
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json({ limit: "50mb" }));
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
