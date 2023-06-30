import { Schema } from "mongoose";

import { apihubDatabase } from "../database";

const EndpointSchema = new Schema({
  title: { type: String, required: true },
  method: { type: String, required: true },
  category: { type: String, required: true },
  latency: { type: String, required: true },
  description: { type: String, required: true },
  snippet: { type: String, required: true },
  response: { type: String, required: true },
});

const EndpointModel = apihubDatabase.model("Endpoints", EndpointSchema);

export default EndpointModel;
