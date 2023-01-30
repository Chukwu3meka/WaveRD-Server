import mongoose from "mongoose";

interface IConnectionEvents {
  connecting: string;
  connected: string;
  open: string;
  disconnecting: string;
  disconnected: string;
  close: string;
  reconnected: string;
  fullsetup: string;
  error: string;
  all: string;
}

const connectionEvents: IConnectionEvents = {
  connecting: "Emitted when Mongoose starts making its initial connection to the MongoDB server",
  connected:
    "Emitted when Mongoose successfully makes its initial connection to the MongoDB server, or when Mongoose reconnects after losing connectivity. May be emitted multiple times if Mongoose loses connectivity.",
  open: "Emitted after 'connected' and onOpen is executed on all of this connection's models.",
  disconnecting: "Your app called Connection#close() to disconnect from MongoDB",
  disconnected:
    "Emitted when Mongoose lost connection to the MongoDB server. This event may be due to your code explicitly closing the connection, the database server crashing, or network connectivity issues.",
  close: "Emitted after Connection#close() successfully closes the connection. If you call conn.close(), you'll get both a 'disconnected' event and a 'close' event.",
  reconnected:
    "Emitted if Mongoose lost connectivity to MongoDB and successfully reconnected. Mongoose attempts to automatically reconnect when it loses connection to the database.",
  error: "Emitted if an error occurs on a connection, like a parseError due to malformed data or a payload larger than 16MB.",
  fullsetup: "Emitted when you're connecting to a replica set and Mongoose has successfully connected to the primary and at least one secondary.",
  all: "Emitted when you're connecting to a replica set and Mongoose has successfully connected to all servers specified in your connection string.",
};

interface IlogMessage {
  label: string;
  event: string;
}
const logMessage = ({ label, event }: IlogMessage) => `MongoDB ${label} Database Connection Events} ::: ${connectionEvents[event as keyof IConnectionEvents]}`;

const modelGenerator = (DB_NAME: string) =>
  mongoose
    .createConnection(process.env[`${DB_NAME}_MONGODB_URI`] as string)
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

//   import connectionEvents, { IConnectionEvents } from "./connEvents";
// import appDB from "./connEvents";

const appDB = modelGenerator("app");
const hubDB = modelGenerator("hub");
const gameDB = modelGenerator("game");

export { hubDB, appDB, gameDB };
