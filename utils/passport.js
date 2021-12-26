const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

let user = {};

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: "273567780526584",
      clientSecret: "7de1a4eebd0709e2860fec3702af607c",
      callbackURL: "/auth/facebook/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(JSON.stringify(profile));
      user = { ...profile };
      return cb(null, profile);
    }
  )
);

// // Google Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: keys.GOOGLE.clientID,
//       clientSecret: keys.GOOGLE.clientSecret,
//       callbackURL: "/auth/google/callback",
//     },
//     (accessToken, refreshToken, profile, cb) => {
//       console.log(chalk.blue(JSON.stringify(profile)));
//       user = { ...profile };
//       return cb(null, profile);
//     }
//   )
// );
