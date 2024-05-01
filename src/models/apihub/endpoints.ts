import { Schema } from "mongoose";

import { apihubDatabase } from "../database";

const EndpointSchema = new Schema({
  path: { type: String, required: true },
  title: { type: String, required: true },
  method: { type: String, required: true },
  bookmarks: { type: Number, required: true },
  latency: { type: Number, required: true },
  category: { type: String, required: true },
  response: { type: String, required: true },
  lastUpdated: { type: Date, default: new Date() },
  description: { type: String, required: true },
  snippets: {
    curl: { title: { type: String, required: true }, snippet: { type: String, required: true } },
    fetch: { title: { type: String, required: true }, snippet: { type: String, required: true } },
  },
});

const EndpointModel = apihubDatabase.model("Endpoints", EndpointSchema);

export default EndpointModel;
