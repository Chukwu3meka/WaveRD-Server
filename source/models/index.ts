import mongoose from "mongoose";
import { modelGenerator } from "../utils/handlers";
import ProfileSchema from "./app-models/profile";

mongoose.set("debug", true);
mongoose.set("strictQuery", false);
mongoose.Promise = global.Promise;

// // mongoose.connect("mongodb://localhost/default");

// const config = async () => {
//   const database = mongoose.createConnection(<string>process.env.MONGODB_URI, {

// ProfileSchema

const appDB = modelGenerator("APP");

const ProfileModel = appDB.model("Profile", ProfileSchema);

const appModels = {
  ProfileModel,
};

const hubDB = modelGenerator("hub");
const gameDB = modelGenerator("game");

export { appModels, hubDB, gameDB, mongoose as default };
