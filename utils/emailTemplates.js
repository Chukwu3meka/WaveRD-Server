const { obfuscate } = require("./serverFunctions");

module.exports.emailTemplates = (templateKey, params) => {
  const templates = {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    resetPassword: `<h2>Password Reset OTP</h2>
    <p>Hi ${params.handle},</p>
    <span>
    Don't share OTP with third parties(Website or Person). A password reset has been initiated on your account, supplying this OTP: ${
      params.otp
    } to SoccerMASS reset page, will complete the process. Alternatively, <a href=${
      process.env.CLIENT
    }auth/reset?serverResetID=${obfuscate(params.otp)}&resetToken=${obfuscate(params.email)}&handle=${
      params.handle
    }>Clicking on this link</a>, will complete the password reset process. SoccerMASS OTP will expire after Three(3) hours. If you didn't request a password reset, there's no need to panic, your account is safe. Simply delete this mail
    </span>`,
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    resetPasswordSuccess: `<h2>Password Reset Success</h2>
    <p>Hi ${params.handle},</p>
    <span>
    Password reset was succesfull. <a href=${process.env.CLIENT}auth/signin>Signin here</a>
    </span>`,

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    accountVerification: `<h2>Account Verification</h2>
    <p>Hi ${params.handle},</p>
    <span>
    Thanks for signing up, We're glad you registered; Ready for the kick off!. An account was created with SoccerMASS using this email on ${new Date(
      params.serverStamp
    ).toDateString()}, to verify &amp; activate your account. Click on this link, <a href="${
      process.env.CLIENT
    }auth/verify?signupReference=${params.signupReference}&serverStamp=${params.serverStamp}&handle=${
      params.handle
    }">Verify my Account</a>. Ignore this mail, if you didn't signup to SoccerMASS: Football manager`,

    update: `<h2>Platform Update</h2>
<p>Hi ${params.handle},</p>
<span>
We updated our platform recently and added more functionalities to our site
\n
<a href=${process.env.CLIENT}auth/signin>Kindly SocceMASS</a>
</span>`,

    templateFornat: `<h2></h2>
                    <p>Hi ${params.handle},</p>
                    <span>
                    </span>`,
  };

  return templates[templateKey];
};
