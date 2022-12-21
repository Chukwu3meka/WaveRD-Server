export St


clientID: process.env.FACEBOOK_CLIENT_ID,
clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
callbackURL: "/auth/facebook/callback",
profileFields: ["id", "emails", "name"],
proxy: trustProxy,
