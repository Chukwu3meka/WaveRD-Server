import { Schema } from "mongoose";

import { apihubDatabase } from "../database";

const EndpointSchema = new Schema({
  title: { type: String, required: true },
  rating: { type: Number, required: true },
  method: { type: String, required: true },
  category: { type: String, required: true },
  latency: { type: String, required: true },
  description: { type: String, required: true },
  codeSnippet: { type: String, required: true },
  successResponse: [
    {
      ref: { type: String, required: true },
      title: { type: String, required: true },
      nickname: { type: String, required: true },
      founded: { type: Number, required: true },
      stadium: { type: String, required: true },
      capacity: { type: Number, required: true },
      location: { type: String, required: true },
      manager: { type: String, required: true },
    },
  ],
});

const EndpointModel = apihubDatabase.model("Endpoints", EndpointSchema);

export default EndpointModel;
