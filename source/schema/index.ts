import mongoose from "mongoose";
import * as appSchema from "./appSchema";
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
    .createConnection(<string>process.env[`${DB_NAME}_MONGODB_URI`], {
      // useNewUrlParser: true,
      // useFindAndModify: true,
      // useCreateIndex: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false,
    })
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

const appDB = modelGenerator("APP"); // ? <= app-api
const appSessionModel = appDB.model("session", appSchema.sessionSchema);
const appUserModel = appDB.model("user", appSchema.userSchema);

const appModels = { appUserModel, appSessionModel };

const hubDB = modelGenerator("hub");
const gameDB = modelGenerator("game");

export { appModels, hubDB, gameDB, mongoose as default };
