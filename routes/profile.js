const handler = require("../handlers"),
  router = require("express").Router(),
  auth = require("../middleware/authentication");

router.route("/signup").post(handler.signup);
router.route("/verifyAccount").post(handler.verifyAccount);
router.route("/resetPasswordOTPSender").post(handler.resetPasswordOTPSender);
router.route("/resetPassword").post(handler.resetPassword);
router.route("/emailTaken").post(handler.emailTaken);
router.route("/signin").post(handler.signin);
router.route("/persistUser").post(handler.persistUser);

module.exports = router;
