const router = require("express").Router();
const handler = require("../handlers");
const auth = require("../middleware/authentication");

router.route("/signup").post(handler.signup);
// router.route("/resendVerification").post(handler.resendVerification);
router.route("/verifyAccount").post(handler.verifyAccount);
router.route("/resetPasswordOTPSender").post(handler.resetPasswordOTPSender);
router.route("/resetPassword").post(handler.resetPassword);

// rebuilding
router.route("/emailTaken").post(handler.emailTaken);
router.route("/signin").post(handler.signin);
router.route("/portfolio").post(auth, handler.portfolio);
router.route("/managers").post(auth, handler.managers);
router.route("/updatesettings").post(auth, handler.updateSettings);

module.exports = router;
