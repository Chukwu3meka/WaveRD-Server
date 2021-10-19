require("dotenv").config();
require("./models");

const passport = require("./middleware/oAuth");
const PORT = process.env.PORT;
const secret = process.env.SECRET;
const app = require("express")();
const routes = require("./routes");
const server = require("http").Server(app);
const io = (module.exports.io = require("socket.io")(server));

const socketManager = require("./handlers/socketManager");

app.use(require("cors")());
app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("body-parser").json({ limit: "50mb" }));
app.use(require("express-session")({ secret, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use("/clubs/", routes.Clubs);
app.use("/players/", routes.Players);
app.use("/masses/", routes.Masses);
app.use("/profiles/", routes.Profiles);
app.use("/trends/", routes.Trends);
app.use("/auth/", routes.oAuth);
app.use("/admin/", routes.Admin);

io.on("connection", socketManager);

server.listen(PORT, () => console.log(`SoccerMASS:::listening on port ${PORT}`));
