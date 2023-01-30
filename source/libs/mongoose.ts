import mongoose from "mongoose";

// mongoose.set("debug", true);
// mongoose.set("strictQuery", false);
// mongoose.Promise = global.Promise;

// const config = () => {
//   mongoose.set("debug", true);
//   mongoose.set("strictQuery", false);
//   mongoose.Promise = global.Promise;
//   mongoose.createConnection(process.env.V1_MONGODB_URI as string, {
//     // useNewUrlParser: true,
//     // useCreateIndex: true,
//     // useUnifiedTopology: true,
//     // useFindAndModify: false,
//   });
//   // .then(() => {
//   //   console.log("MongoDB Connected Successfully");
//   // })
//   // .catch((err: any) => {
//   //   throw { message: `MongoDB Error: ${err}` };
//   // });
// };

// export default { config };

// mongoose.set("debug", true);
// mongoose.set("strictQuery", false);
// mongoose.Promise = global.Promise;

// const connectionEvents=()=>{

// }

const v1MongoDB = mongoose
  .createConnection(process.env.V1_MONGODB_URI as string)
  .on("connected", () => console.log("MongoDB V1 Database connected"))
  .on("error", () => console.log("MongoDB V1 Database encountered error"))
  .on("disconnected", () => console.log("MongoDB V1 Database disconnected"));

const hubMongoDB = mongoose
  .createConnection(process.env.API_MONGODB_URI as string)
  .on("connected", () => console.log("MongoDB Hub Database connected"))
  .on("error", () => console.log("MongoDB Hub Database encountered error"))
  .on("disconnected", () => console.log("MongoDB Hub Database disconnected"));

const gameMongoDB = mongoose
  .createConnection(process.env.GAME_MONGODB_URI as string)
  .on("connected", () => console.log("MongoDB Game Database connected"))
  .on("error", () => console.log("MongoDB Game Database encountered error"))
  .on("disconnected", () => console.log("MongoDB Game Database disconnected"));

export { v1MongoDB, hubMongoDB, gameMongoDB, mongoose as default };

// // getting-started.js
// const mongoose = require("mongoose");

// main().catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect("mongodb://127.0.0.1:27017/test");

//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }

// const conn = mongoose.createConnection("mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]", options);

// # MONGODB_URI = "mongodb+srv://chukwuemeka:sm2018@smcluster1.bj62x.mongodb.net/SoccerMASS?retryWrites=true&w=majority"
