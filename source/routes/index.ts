import v1 from "./v1";
import redirect from "./redirect";
// import Club from "./club";
// import Mass from "./mass";
// import Admin from "./admin";
// import Trend from "./trend";
// import oAuth from "./oAuth";
// import Player from "./player";
// import Profile from "./profile";

export default (app: any) => {
  app.use("/api", redirect);
  app.use("/api/v1", v1);
  // app.use("/club/", routes.Club);
  // app.use("/mass/", routes.Mass);
  // app.use("/auth/", routes.oAuth);ff
  // app.use("/trend/", routes.Trend);
  // app.use("/admin/", routes.Admin);
  // app.use("/player/", routes.Player);
  // app.use("/profile/", routes.Profile);
};
