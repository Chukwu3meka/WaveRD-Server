import express from "express";

import accountInfo from "../handlers/admin/accountInfo";

const router = express.Router();

router.route("/account-info").get(accountInfo);

export default router;
