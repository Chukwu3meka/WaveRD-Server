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
  const mailDetails = { from: emailAddress, to: address, subject: subject, html: templates[template]({ ...payload }) };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      if (process.env.NODE_ENV === "development") {
        console.log("error sending mail", err);
      }
      if (process.env.NODE_ENV === "production") {
        // console.log("error sending mail", err);
        // add to server logs0
      }
    } else {
      if (process.env.NODE_ENV === "development") console.log("Email sent successfully");
    }
  });
};
