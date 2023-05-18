import { Schema } from "mongoose";
import { consoleDatabase } from "../database";

const AllRequestsSchema = new Schema({
  path: { type: String },
  time: { type: Date, default: Date.now },
  domain: { type: String, required: true },
  version: { type: String, required: true },
});

const AllRequestsModel = consoleDatabase.model("All_Requests", AllRequestsSchema);

export default AllRequestsModel;
