const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;

let trustProxy = false;
if (process.env.DYNO) trustProxy = true;

passport.use(
  new FacebookStrategy(
    {
      clientID: "273567780526584",
      clientSecret: "7de1a4eebd0709e2860fec3702af607c",
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
      proxy: trustProxy,
    },
    (accessToken, refreshToken, profile, cb) => {
      const email = profile.emails[0].value;
      return cb(null, email);
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: "701577338758-vr6kg61ta90k8g0jcpgf02a76qapreae.apps.googleusercontent.com",
      clientSecret: "d5rd3xS8pPYkAlyOgNng8IPV",
      callbackURL: `${process.env.SERVER}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, cb) => {
      const email = profile.emails[0].value;
      return cb(null, email);
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: "vmS6tj9qgMBRIpMAqH46yVJOY",
      consumerSecret: "gc5ZTRZhL5wXYherp1wt7l5mo3Fy3GdYH8LU17pR1PFIkMoUqJ",
      userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
      callbackURL: `/auth/twitter/callback`,
      proxy: trustProxy,
    },
    (accessToken, refreshToken, profile, cb) => {
      const email = profile.emails[0].value;
      return cb(null, email);
    }
  )
);

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

module.exports = passport;
