import passport from "passport";
import twitterPassport from "passport-twitter";
import facebookPassport from "passport-facebook";
import googlePassport from "passport-google-oauth20";

// let trustProxy = false;
// if (process.env.DYNO) trustProxy = true;

const returnEmail = (profile: any, cb: any) => {
  if (profile.emails) {
    const email = profile.emails[0].value;
    return cb(null, email);
  }
  throw { message: "email not found" };
};

// verify that env files are available
passport.use(
  new facebookPassport.Strategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      callbackURL: process.env.NODE_ENV === "production" ? "https://srv-accounts.soccermass.com/api/facebook/callback" : "/api/accounts/facebook/callback",
      profileFields: ["id", "emails", "name"],
      // proxy: trustProxy,
    },
    (accessToken, refreshToken, profile, cb) => returnEmail(profile, cb)
  )
);

passport.use(
  new googlePassport.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.NODE_ENV === "production" ? `https://srv-accounts.soccermass.com/api/google/callback` : `/api/accounts/google/callback`,
    },
    (accessToken: any, refreshToken: any, profile: any, cb: any) => returnEmail(profile, cb)
  )
);

passport.use(
  new twitterPassport.Strategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
      userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
      callbackURL: process.env.NODE_ENV === "production" ? `https://srv-accounts.soccermass.com/api/twitter/callback` : `/api/accounts/twitter/callback`,
      // proxy: trustProxy,
    },
    (accessToken, refreshToken, profile, cb) => returnEmail(profile, cb)
  )
);

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user: any, cb) => cb(null, user));

export default passport;
