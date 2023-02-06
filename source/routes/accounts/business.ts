import { redirectToWeb } from "../../utils/handlers";

export default (app: any) => {
  app.use("/accounts/api/business", redirectToWeb);
};
