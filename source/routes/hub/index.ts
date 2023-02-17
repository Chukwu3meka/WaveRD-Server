import cors from "cors";

import hub from "./routes";

export default (app: any) => {
  app.use("/api/hub", cors(), hub);
};
