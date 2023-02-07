import mongoose from "mongoose";
import { accounts } from "../schema";
import connectionEvents, { IConnectionEvents } from "../utils/mdbConnEvents";

mongoose.set("debug", true);
mongoose.set("strictQuery", false);
mongoose.Promise = global.Promise;

interface IlogMessage {
  label: string;
  event: string;
}
const logMessage = ({ label, event }: IlogMessage) => `MongoDB ${label} Database Connection Events} ::: ${connectionEvents[event as keyof IConnectionEvents]}`;

const modelGenerator = (DB_NAME: string) => {
  return mongoose
    .createConnection(<string>process.env[`${DB_NAME}_MONGODB_URI`], {})
    .on("all", () => logMessage({ label: DB_NAME, event: "all" }))
    .on("open", () => logMessage({ label: DB_NAME, event: "open" }))
    .on("error", () => logMessage({ label: DB_NAME, event: "error" }))
    .on("close", () => logMessage({ label: DB_NAME, event: "close" }))
    .on("connected", () => logMessage({ label: DB_NAME, event: "connected" }))
    .on("fullsetup", () => logMessage({ label: DB_NAME, event: "fullsetup" }))
    .on("connecting", () => logMessage({ label: DB_NAME, event: "connecting" }))
    .on("reconnected", () => logMessage({ label: DB_NAME, event: "reconnected" }))
    .on("disconnected", () => logMessage({ label: DB_NAME, event: "disconnected" }))
    .on("disconnecting", () => logMessage({ label: DB_NAME, event: "disconnecting" }));
};

const accountsDatabase = modelGenerator("ACCOUNTS"); // ? <= accounts-api

// personal accounts
const personalProfileModel = accountsDatabase.model("Personal_Profile", accounts.personal.profile, "Personal_Profile");
const personalSessionModel = accountsDatabase.model("Personal_Session", accounts.personal.session, "Personal_Session");

const accountsModel = { personalProfileModel, personalSessionModel };

export { accountsModel, mongoose as default };
