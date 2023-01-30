import mongoose from "mongoose";

const createModel = (modelName: string) => {
  return mongoose
    .createConnection(process.env[`${modelName}_MONGODB_URI`] as string)
    .on("connected", () => console.log(`MongoDB ${modelName} Database connected`))
    .on("error", () => console.log(`MongoDB ${modelName} Database encountered error`))
    .on("disconnected", () => console.log(`MongoDB ${modelName} Database disconnected`));
};

// connect to Database
const appDB = createModel("app");
const hubDB = createModel("hub");
const gameDB = createModel("game");

export { hubDB, appDB, gameDB };
