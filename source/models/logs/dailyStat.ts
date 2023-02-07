import { Schema } from "mongoose";
import { logsDatabase } from "../../utils/database";

const DailyStatSchema = new Schema({
  date: { type: String, default: new Date().toDateString(), unique: true },
  subdomains: {
    hub: { type: Number, required: true, default: 0 },
    game: { type: Number, required: true, default: 0 },
    logs: { type: Number, required: true, default: 0 },
    accounts: { type: Number, required: true, default: 0 },
  },
});

// DailyStatSchema.pre("", async function (next) {
//   try {
//     if (!this.isModified("password")) return next();

//     const hashedId = await bcrypt.hash(this._id.toString(), 10);

//     // make session longer by replacing special characters
//     this.session = `${uniqueId()}-${hashedId}-${uniqueId()}`.replaceAll("/", uniqueId()).replaceAll("$", uniqueId()).replaceAll(".", uniqueId());

//     const hashedPassword = await bcrypt.hash(this.password, 10);
//     this.password = hashedPassword;

//     return next();
//   } catch (err: any) {
//     return next(err);
//   }
// });

const DailyStatModel = logsDatabase.model("Daily_Stat", DailyStatSchema);

export default DailyStatModel;
