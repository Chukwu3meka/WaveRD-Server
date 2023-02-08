import { Schema } from "mongoose";

import { logsDatabase } from "../database";

const FailedRequestsSchema = new Schema({
  message: { type: String, required: true },
  payload: { type: Object, required: true },
  endpoint: { type: String, required: true },
  date: { type: String, default: Date.now() },
});

const FailedRequestsModel = logsDatabase.model("Failed_Requests", FailedRequestsSchema);

export default FailedRequestsModel;
