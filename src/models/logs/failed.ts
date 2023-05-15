import { Schema } from "mongoose";

import { logsDatabase } from "../database";

const FailedRequestsSchema = new Schema({
  error: { type: Object, required: true },
  payload: { type: Object, required: true },
  request: { type: Object, required: true },
  time: { type: String, default: Date.now() },
});

const FailedRequestsModel = logsDatabase.model("Failed_Requests", FailedRequestsSchema);

export default FailedRequestsModel;
