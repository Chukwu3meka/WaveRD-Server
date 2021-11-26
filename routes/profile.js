const handler = require("../handlers"),
  router = require("express").Router(),
  auth = require("../middleware/authentication");

router.route("/signup").post(handler.signup);
router.route("/verifyAccount").post(handler.verifyAccount);
router.route("/resetPasswordOTPSender").post(handler.resetPasswordOTPSender);
router.route("/resetPassword").post(handler.resetPassword);
router.route("/emailTaken").post(handler.emailTaken);
router.route("/signin").post(handler.signin);

router.route("/persistUser").post(auth, () => {});

// rebuilding
// router.route("/resendVerification").post(handler.resendVerification);
// router.route("/portfolio").post(auth, handler.portfolio);
// router.route("/managers").post(auth, handler.managers);
// router.route("/updatesettings").post(auth, handler.updateSettings);

module.exports = router;
