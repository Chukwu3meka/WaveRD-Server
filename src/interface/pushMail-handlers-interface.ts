export interface PushMail {
  subject: string;
  address: string;
  payload?: object;
  account: "noreply" | "accounts" | "contactus";
  template: "welcome" | "failedLogin" | "lockNotice" | "reVerifyEmail" | "successfulLogin" | "resetPassword" | "forgotPassword" | "dataDeletion";
}
