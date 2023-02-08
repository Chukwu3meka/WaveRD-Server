interface IPushMail {
  subject: string;
  address: string;
  payload?: object;
  account: "noreply" | "accounts" | "contactus";
  template: "welcome" | "failedLogin" | "lockNotice" | "reVerifyEmail";
}

import nodemailer from "nodemailer";
import * as templates from "../templates";

export default async ({ account, template, address, subject, payload = {} }: IPushMail) => {
  const emailAccount = account === "noreply" ? "NO_REPLY_EMAIL" : account === "accounts" ? "ACCOUNTS_EMAIL" : "CONTACT_US_EMAIL";
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailAddress = process.env[emailAccount];

  const mailTransporter = nodemailer.createTransport({ service: "zoho", auth: { user: emailAddress, pass: emailPassword } });

  const html = `<!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <title> </title>
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <!--<![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style type="text/css">
        #outlook a {
          padding: 0;
        }
  
        body {
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
  
        table,
        td {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
  
        img {
          border: 0;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
        }
  
        p {
          display: block;
          margin: 13px 0;
        }
      </style>
      <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG />
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
      <![endif]-->
      <!--[if lte mso 11]>
        <style type="text/css">
          .mj-outlook-group-fix {
            width: 100% !important;
          }
        </style>
      <![endif]-->
      <!--[if !mso]><!-->
      <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css" />
      <style type="text/css">
        @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
      </style>
      <!--<![endif]-->
      <style type="text/css">
        @media only screen and (min-width: 480px) {
          .mj-column-per-100 {
            width: 100% !important;
            max-width: 100%;
          }
        }
      </style>
      <style media="screen and (min-width:480px)">
        .moz-text-html .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
      </style>
      <style type="text/css">
        @media only screen and (max-width: 480px) {
          table.mj-full-width-mobile {
            width: 100% !important;
          }
  
          td.mj-full-width-mobile {
            width: auto !important;
          }
        }
      </style>
    </head>
  
    <body style="word-spacing: normal">
      <div style="">
        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
        <div style="margin: 0px auto; max-width: 600px">
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%">
            <tbody>
              <tr>
                <td style="direction: ltr; font-size: 0px; padding: 20px 0; text-align: center">
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  <div
                    class="mj-column-per-100 mj-outlook-group-fix"
                    style="font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f6f6f6; vertical-align: top" width="100%">
                      <tbody>
                        <tr>
                          <td align="center" style="font-size: 0px; padding: 10px; word-break: break-word">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse; border-spacing: 0px">
                              <tbody>
                                <tr>
                                  <td>
                                    <a href="https://soccermass.com" target="_blank">
                                      <img
                                        src="https://soccermass.com/images/layout/soccermass.webp"
                                        style="
                                          border: 0;
                                          border-radius: 50%;
                                          display: block;
                                          outline: none;
                                          text-decoration: none;
                                          min-height: 100px !important;
                                          height: 100px !important;
                                          max-height: 100px !important;
                                          width: 100px !important;
                                          max-width: none;
                                        " />
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 0px; padding: 10px 25px; word-break: break-word">
                            <p style="border-top: solid 4px #448b44; font-size: 1px; margin: 0px auto; width: 100%"></p>
                            <!--[if mso | IE
                              ]><table
                                align="center"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                style="border-top: solid 4px #448b44; font-size: 1px; margin: 0px auto; width: 550px"
                                role="presentation"
                                width="550px">
                                <tr>
                                  <td style="height: 0; line-height: 0">&nbsp;</td>
                                </tr>
                              </table><!
                            [endif]-->
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="font-size: 0px; padding: 10px 25px; word-break: break-word; line-height: 25px">
                            <div>
                              <p style="font-family: helvetica; font-size: 16px; text-align: left; color: #413f3f" ; line-height: 25px;>
                                ${templates[template]({ ...payload })}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
        <div style="margin: 0px auto; max-width: 600px">
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%">
            <tbody>
              <tr>
                <td style="direction: ltr; font-size: 0px; padding: 20px 0; text-align: center">
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  <div
                    class="mj-column-per-100 mj-outlook-group-fix"
                    style="font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align: top" width="100%">
                      <tbody>
                        <tr>
                          <td align="center" style="font-size: 0px; padding: 10px 25px; word-break: break-word">
                            <div style="font-family: helvetica; font-size: 24px; font-weight: 700; line-height: 1; text-align: center; color: #448b44">
                              SoccerMASS
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 0px; padding: 10px 25px; word-break: break-word">
                            <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" ><tr><td><![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float: none; display: inline-table">
                              <tr>
                                <td style="padding: 4px; vertical-align: middle">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-radius: 3px; width: 30px">
                                    <tr>
                                      <td style="font-size: 0; height: 30px; vertical-align: middle; width: 30px">
                                        <a href="https://web.facebook.com/soccermass" target="_blank">
                                          <img
                                            height="30"
                                            src="https://soccermass.com/images/social/facebook.png"
                                            style="border-radius: 3px; display: block"
                                            width="30" />
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <!--[if mso | IE]></td><td><![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float: none; display: inline-table">
                              <tr>
                                <td style="padding: 4px; vertical-align: middle">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-radius: 3px; width: 30px">
                                    <tr>
                                      <td style="font-size: 0; height: 30px; vertical-align: middle; width: 30px">
                                        <a href="https://twitter.com/SoccerMASSinc" target="_blank">
                                          <img
                                            height="30"
                                            src="https://soccermass.com/images/social/twitter.png"
                                            style="border-radius: 3px; display: block"
                                            width="30" />
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <!--[if mso | IE]></td><td><![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float: none; display: inline-table">
                              <tr>
                                <td style="padding: 4px; vertical-align: middle">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-radius: 3px; width: 30px">
                                    <tr>
                                      <td style="font-size: 0; height: 30px; vertical-align: middle; width: 30px">
                                        <a href="https://www.instagram.com/SoccerMASSinc" target="_blank">
                                          <img
                                            height="30"
                                            src="https://soccermass.com/images/social/instagram.png"
                                            style="border-radius: 3px; display: block"
                                            width="30" />
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <!--[if mso | IE]></td><td><![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float: none; display: inline-table">
                              <tr>
                                <td style="padding: 4px; vertical-align: middle">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-radius: 3px; width: 30px">
                                    <tr>
                                      <td style="font-size: 0; height: 30px; vertical-align: middle; width: 30px">
                                        <a href="https://www.linkedin.com/company/soccermass" target="_blank">
                                          <img
                                            height="30"
                                            src="https://soccermass.com/images/social/linkedin.png"
                                            style="border-radius: 3px; display: block"
                                            width="30" />
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <!--[if mso | IE]></td><td><![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float: none; display: inline-table">
                              <tr>
                                <td style="padding: 4px; vertical-align: middle">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-radius: 3px; width: 30px">
                                    <tr>
                                      <td style="font-size: 0; height: 30px; vertical-align: middle; width: 30px">
                                        <a href="https://wa.me/qr/5KYEVNBVLVVSI1" target="_blank">
                                          <img
                                            height="30"
                                            src="https://soccermass.com/images/social/whatsapp.png"
                                            style="border-radius: 3px; display: block"
                                            width="30" />
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <!--[if mso | IE]></td><td><![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float: none; display: inline-table">
                              <tr>
                                <td style="padding: 4px; vertical-align: middle">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-radius: 3px; width: 30px">
                                    <tr>
                                      <td style="font-size: 0; height: 30px; vertical-align: middle; width: 30px">
                                        <a href="tel:+234(706)-441-7213" target="_blank">
                                          <img
                                            height="30"
                                            src="https://soccermass.com/images/social/phone.png"
                                            style="border-radius: 3px; display: block"
                                            width="30" />
                                        </a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <!--[if mso | IE]></td></tr></table><![endif]-->
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 0px; padding: 10px 25px; word-break: break-word">
                            <div style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1; text-align: center; color: #1d1b1b">
                              <p style="line-height: 25px">
                                You've received this email because of your recent activity on our website. If you prefer not to receive any more emails from us,
                                kindly unsubscribe
                                <strong
                                  ><a target="_blank" href="https://soccermass.com/profile/subscriptions" style="text-decoration: none; color: rgb(68, 139, 68)"
                                    >here</a
                                  ></strong
                                >.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--[if mso | IE]></td></tr></table><![endif]-->
      </div>
    </body>
  </html>
  `;

  const mailDetails = { from: emailAddress, to: address, subject: subject, html };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) throw { message: "error sending mail" };
  });
};
