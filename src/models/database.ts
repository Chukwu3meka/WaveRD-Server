import mongoose from "mongoose";

mongoose.Promise = global.Promise;

mongoose.set({
  strictQuery: false,
  debug: false, // ? <= hide console messages
});

interface IConnectionEvents {
  all: string;
  open: string;
  close: string;
  error: string;
  connected: string;
  fullsetup: string;
  connecting: string;
  reconnected: string;
  disconnected: string;
  disconnecting: string;
}

const connectionEvents: IConnectionEvents = {
  connecting: "Emitted when Mongoose starts making its initial connection to the MongoDB server",
  connected:
    "Emitted when Mongoose successfully makes its initial connection to the MongoDB server, or when Mongoose reconnects after losing connectivity. May be emitted multiple times if Mongoose loses connectivity.",
  open: "Emitted after 'connected' and onOpen is executed on all of this connection's models.",
  disconnecting: "Your app called Connection#close() to disconnect from MongoDB",
  disconnected:
    "Emitted when Mongoose lost connection to the MongoDB server. This event may be due to your code explicitly closing the connection, the database server crashing, or network connectivity issues.",
  close:
    "Emitted after Connection#close() successfully closes the connection. If you call conn.close(), you'll get both a 'disconnected' event and a 'close' event.",
  reconnected:
    "Emitted if Mongoose lost connectivity to MongoDB and successfully reconnected. Mongoose attempts to automatically reconnect when it loses connection to the database.",
  error: "Emitted if an error occurs on a connection, like a parseError due to malformed data or a data larger than 16MB.",
  fullsetup: "Emitted when you're connecting to a replica set and Mongoose has successfully connected to the primary and at least one secondary.",
  all: "Emitted when you're connecting to a replica set and Mongoose has successfully connected to all servers specified in your connection string.",
};

interface IlogMessage {
  label: string;
  event: string;
}
const logMessage = ({ label, event }: IlogMessage) =>
  `MongoDB ${label} Database Connection Events} ::: ${connectionEvents[event as keyof IConnectionEvents]}`;

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

const infoDatabase = modelGenerator("INFO"); // ? <= Client Database
const gamesDatabase = modelGenerator("GAMES"); // ? <= Games Database
const apihubDatabase = modelGenerator("APIHUB"); // ? <= API Hub Database
const consoleDatabase = modelGenerator("CONSOLE"); // ? <= Moderators Database
const accountsDatabase = modelGenerator("ACCOUNTS"); // ? <= Auth/Accounts  Database

export { accountsDatabase, consoleDatabase, infoDatabase, apihubDatabase, gamesDatabase };
