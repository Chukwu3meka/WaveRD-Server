import passport from "passport";
import twitterPassport from "passport-twitter";
import facebookPassport from "passport-facebook";
import googlePassport from "passport-google-oauth20";

let trustProxy = false;
if (process.env.DYNO) trustProxy = true;

const returnEmail = (profile: any, cb: any) => {
  if (profile.emails) {
    const email = profile.emails[0].value;
    return cb(null, email);
  }
  throw { errMsg: "email not found" };
};

// verify that env files are available
if (
  process.env.FACEBOOK_CLIENT_ID &&
  process.env.FACEBOOK_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.TWITTER_CONSUMER_KEY &&
  process.env.TWITTER_CONSUMER_SECRET
) {
  passport.use(
    new facebookPassport.Strategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "emails", "name"],
        // proxy: trustProxy,
      },
      (accessToken, refreshToken, profile, cb) => returnEmail(profile, cb)
    )
  );

  passport.use(
    new googlePassport.Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `/auth/google/callback`,
      },
      (accessToken: any, refreshToken: any, profile: any, cb: any) => returnEmail(profile, cb)
    )
  );

  passport.use(
    new twitterPassport.Strategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
        callbackURL: `/auth/twitter/callback`,
        // proxy: trustProxy,
      },
      (accessToken, refreshToken, profile, cb) => returnEmail(profile, cb)
    )
  );
} else {
  throw { errMsg: "Can't find required ENV for proper app functioning" };
}

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user: any, cb) => cb(null, user));

export { passport as default };
