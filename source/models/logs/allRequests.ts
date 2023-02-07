import { Schema } from "mongoose";
import { logsDatabase } from "../database";

const AllRequestsSchema = new Schema({
  time: { type: Date, default: Date.now },
  endpoint: { type: String, required: true },
  subdomain: { type: String, required: true },
});

const AllRequestModel = logsDatabase.model("All_Requests", AllRequestsSchema, "All_Requests");

export default AllRequestModel;
