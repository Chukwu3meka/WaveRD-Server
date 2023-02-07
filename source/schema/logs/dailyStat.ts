import { Schema } from "mongoose";
import { logsDatabase } from "../../utils/models";

const AllRequestsSchema = new Schema({
  date: { type: String, default: new Date().toDateString() },
  subdomains: {
    hub: { type: Number, required: 0 },
    game: { type: Number, required: 0 },
    logs: { type: Number, required: 0 },
    accounts: { type: Number, required: 0 },
  },
});

const AllRequestModel = logsDatabase.model("Daily_Stat", AllRequestsSchema);

export default AllRequestModel;
