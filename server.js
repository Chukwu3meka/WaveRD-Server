require("dotenv").config(); // enable reading from .env file
require("./models"); // enable app access database
require("./task"); // run task

const passport = require("./middleware/oAuth");
const PORT = process.env.PORT;
const secret = process.env.SECRET;

const app = require("express")();
app.use(require("cors")());

const routes = require("./routes");
const server = require("http").Server(app);
const io = (module.exports.io = require("socket.io")(server));

const socketManager = require("./handlers/socketManager");

app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("body-parser").json({ limit: "50mb" }));
app.use(require("cookie-session")({ secret, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use("/club/", routes.Club);
app.use("/mass/", routes.Mass);
app.use("/auth/", routes.oAuth);
app.use("/trend/", routes.Trend);
app.use("/admin/", routes.Admin);
app.use("/player/", routes.Player);
app.use("/profile/", routes.Profile);

io.on("connection", socketManager);

server.listen(PORT, () => console.log(`SoccerMASS:::listening on port ${PORT}`));
