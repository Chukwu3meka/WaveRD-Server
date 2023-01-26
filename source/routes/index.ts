import express from "express";
const router = express.Router();

import v1Auth from "./v1/auth";

import redirectToWeb from "../libs/redirectToWeb";

export default (app: any) => {
  // ? Redirect Calls
  app.use("/", router.route("/").all(redirectToWeb)); // domain
  app.use("/v1", router.route("/").all(redirectToWeb)); // v1.domain
  app.use("/api", router.route("/").all(redirectToWeb)); // api.domain

  // ? Internal Calls
  app.use("/v1/auth", v1Auth);

  // ? External Calls
};
