export interface PushMail {
  subject: string;
  address: string;
  data?: object;
  account: "noreply" | "accounts" | "contactus";
  template: "welcome" | "failedLogin" | "lockNotice" | "reVerifyEmail" | "successfulLogin" | "initiatePasswordReset" | "confirmPasswordReset" | "dataDeletion";
}
