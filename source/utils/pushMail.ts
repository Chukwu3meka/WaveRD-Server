interface IPushMail {
  payload: any;
  subject: string;
  address: string;
  template: "welcome";
  account: "noreply" | "accounts" | "contactus";
}

import nodemailer from "nodemailer";
import * as templates from "../templates";

export default async ({ account, template, address, subject, payload }: IPushMail) => {
  const emailAccount = account === "noreply" ? "NO_REPLY_EMAIL" : account === "accounts" ? "ACCOUNTS_EMAIL" : "CONTACT_US_EMAIL";
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailAddress = process.env[emailAccount];

  const mailTransporter = nodemailer.createTransport({ service: "zoho", auth: { user: emailAddress, pass: emailPassword } });

  const html = `<!DOCTYPE html>
  <html style="width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; padding: 0; margin: 0">
    <head>
      <meta charset="UTF-8" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta content="telephone=no" name="format-detection" />
      <title>SoccerMASS Email</title>
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet" />
    </head>
    <body
      style="
        width: 100%;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        font-family: arial, 'helvetica neue', helvetica, sans-serif;
        padding: 0;
        margin: 0;
      ">
      <div style="background-color: #f6f6f6">
        <table
          width="100%"
          cellspacing="0"
          cellpadding="0"
          style="
            border-collapse: collapse;
            border-spacing: 0px;
            padding: 0;
            margin: 0;
            width: 100%;
            height: 100%;
            background-repeat: repeat;
            background-position: center top;
            background-color: #f6f6f6;
          ">
          <tr style="border-collapse: collapse">
            <td valign="top" style="padding: 0px; margin: 0">
              <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="border-collapse: collapse; border-spacing: 0px">
                <tr style="border-collapse: collapse">
                  <td align="center" style="padding: 30px 0 0; margin: 0; font-size: 0px">
                    <img
                      alt
                      width="80"
                      height="80"
                      src="https://soccermass.com/images/layout/soccermass.webp"
                      style="display: block; border: 0; overflow: hidden; border-radius: 50%; outline: none; text-decoration: none" />
                  </td>
                </tr>
  
                <tr style="border-collapse: collapse">
                  <td align="left" style="padding: 10px; margin: 0; padding-top: 5px">
                    <p
                      style="
                        padding: 20px 50px;
                        margin: 0;
                        -webkit-text-size-adjust: none;
                        -ms-text-size-adjust: none;
                        font-family: arial, 'helvetica neue', helvetica, sans-serif;
                        line-height: 30px;
                        color: #333333;
                        font-size: 16px;
                      ">
                      ${templates[template]({ ...payload })}
                    </p>
                  </td>
                </tr>
              </table>
              <table
                cellpadding="0"
                cellspacing="0"
                align="center"
                style="
                  border-collapse: collapse;
                  border-spacing: 0px;
                  width: 100%;
                  background-color: #ffffff;
                  background-repeat: repeat;
                  background-position: center top;
                ">
                <tr style="border-collapse: collapse">
                  <td align="center" style="padding: 0; margin: 0">
                    <table
                      bgcolor="#ffffff"
                      align="center"
                      cellpadding="0"
                      cellspacing="0"
                      style="border-collapse: collapse; border-spacing: 0px; background-color: #ffffff; width: 640px">
                      <tr style="border-collapse: collapse">
                        <td align="left" style="margin: 0; padding-left: 20px; padding-right: 20px; padding-top: 25px; padding-bottom: 25px">
                          <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border-spacing: 0px">
                            <tr style="border-collapse: collapse">
                              <td align="center" valign="top" style="padding: 0; margin: 0; width: 600px">
                                <table
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  role="presentation"
                                  style="border-collapse: collapse; text-align: center; border-spacing: 0px">
                                  <tr style="border-collapse: collapse">
                                    <td style="padding: 10px 10px 0px; margin: 0">
                                      <h2
                                        style="
                                          margin: 0;
                                          line-height: 29px;
                                          font-family: Roboto, sans-serif;
                                          font-size: 24px;
                                          padding-bottom: 10px;
                                          font-style: normal;
                                          font-weight: bold;
                                          color: rgb(68, 139, 68);
                                        ">
                                        SoccerMASS
                                      </h2>
                                    </td>
                                  </tr>
                                </table>
  
                                <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="border-collapse: collapse; border-spacing: 0px">
                                  <tr style="border-collapse: collapse">
                                    <td align="center" style="padding: 0; margin: 0; padding-bottom: 15px; font-size: 0">
                                      <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse; border-spacing: 0px">
                                        <tr style="border-collapse: collapse">
                                          <td align="center" valign="top" style="padding: 0; margin: 0; padding-right: 10px">
                                            <a
                                              target="_blank"
                                              href="https://web.facebook.com/soccermass"
                                              style="-webkit-text-size-adjust: none; -ms-text-size-adjust: none; text-decoration: underline; color: #000000"
                                              ><img
                                                src="https://jnnhyi.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/facebook-circle-gray-bordered.png"
                                                alt="Fb"
                                                title="Facebook"
                                                width="32"
                                                style="display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic"
                                            /></a>
                                          </td>
                                          <td align="center" valign="top" style="padding: 0; margin: 0; padding-right: 10px">
                                            <a
                                              target="_blank"
                                              href="https://twitter.com/SoccerMASSinc/"
                                              style="-webkit-text-size-adjust: none; -ms-text-size-adjust: none; text-decoration: underline; color: #000000"
                                              ><img
                                                src="https://jnnhyi.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/twitter-circle-gray-bordered.png"
                                                alt="Tw"
                                                title="Twitter"
                                                width="32"
                                                style="display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic"
                                            /></a>
                                          </td>
                                          <td align="center" valign="top" style="padding: 0; margin: 0; padding-right: 10px">
                                            <a
                                              target="_blank"
                                              href="https://www.instagram.com/SoccerMASSinc/"
                                              style="-webkit-text-size-adjust: none; -ms-text-size-adjust: none; text-decoration: underline; color: #000000"
                                              ><img
                                                src="https://jnnhyi.stripocdn.email/content/assets/img/social-icons/circle-gray-bordered/instagram-circle-gray-bordered.png"
                                                alt="Ig"
                                                title="Instagram"
                                                width="32"
                                                style="display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic"
                                            /></a>
                                          </td>
                                          <td align="center" valign="top" style="padding: 0; margin: 0; padding-right: 10px">
                                            <a
                                              target="_blank"
                                              href="https://wa.me/qr/5KYEVNBVLVVSI1"
                                              style="-webkit-text-size-adjust: none; -ms-text-size-adjust: none; text-decoration: underline; color: #000000"
                                              ><img
                                                src="https://stripo.email/static/assets/img/messenger-icons/circle-gray-bordered/whatsapp-circle-gray-bordered.png"
                                                alt="Whatsapp"
                                                title="Whatsapp"
                                                width="32"
                                                style="display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic"
                                            /></a>
                                          </td>
                                          <td align="center" valign="top" style="padding: 0; margin: 0; padding-right: 10px">
                                            <a
                                              target="_blank"
                                              href="tel:+234(706)-441-7213"
                                              style="-webkit-text-size-adjust: none; -ms-text-size-adjust: none; text-decoration: underline; color: #000000"
                                              ><img
                                                src="https://stripo.email/static/assets/img/other-icons/circle-gray-bordered/phone-circle-gray-bordered.png"
                                                alt="Phone"
                                                title="Phone"
                                                width="32"
                                                style="display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic"
                                            /></a>
                                          </td>
                                          <td align="center" valign="top" style="padding: 0; margin: 0">
                                            <a
                                              target="_blank"
                                              href="https://soccermass.com"
                                              style="-webkit-text-size-adjust: none; -ms-text-size-adjust: none; text-decoration: underline; color: #000000"
                                              ><img
                                                src="https://stripo.email/static/assets/img/other-icons/circle-gray-bordered/globe-circle-gray-bordered.png"
                                                alt="World"
                                                title="World"
                                                width="32"
                                                style="display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic"
                                            /></a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr style="border-collapse: collapse">
                                    <td align="center" esdev-links-color="#666666" style="padding: 0; margin: 0">
                                      <p
                                        style="
                                          margin: 0;
                                          -webkit-text-size-adjust: none;
                                          -ms-text-size-adjust: none;
                                          font-family: arial, 'helvetica neue', helvetica, sans-serif;
                                          line-height: 18px;
                                          color: #1d1b1b;
                                          font-size: 14px;
                                        ">
                                        This email has been sent to you as a result of your recent visit to our website. If you prefer not to receive any more
                                        emails from us, kindly unsubscribe
                                        <strong
                                          ><a
                                            target="_blank"
                                            href="https://soccermass.com/profile/subscriptions"
                                            style="
                                              text-decoration: none;
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              color: rgb(68, 139, 68);
                                              font-size: 14px;
                                            "
                                            >here</a
                                          ></strong
                                        >.
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </body>
  </html>  
  `;

  const mailDetails = { from: emailAddress, to: address, subject: subject, html };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) throw { message: "error sending mail" };
  });
};
