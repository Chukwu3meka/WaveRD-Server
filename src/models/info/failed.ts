import { Schema } from "mongoose";

import { infoDatabase } from "../database";

const FailedRequestsSchema = new Schema({
  error: { type: Object, required: true },
  data: { type: Object, required: true },
  request: { type: Object, required: true },
  time: { type: String, default: Date.now() },
});

const FailedRequestsModel = infoDatabase.model("Failed_Requests", FailedRequestsSchema);

export default FailedRequestsModel;
