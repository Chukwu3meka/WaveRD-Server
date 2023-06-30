import { Schema } from "mongoose";

import { consoleDatabase } from "../database";

const FailedRequestsSchema = new Schema({
  error: { type: Object, required: true },
  data: { type: Object, required: true },
  request: { type: Object, required: true },
  time: { type: String, default: Date.now() },
});

const FailedRequestsModel = consoleDatabase.model("Failed_Requests", FailedRequestsSchema);

export default FailedRequestsModel;
