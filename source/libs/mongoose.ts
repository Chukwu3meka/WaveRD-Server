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

mongoose.set("debug", true);
mongoose.set("strictQuery", false);
mongoose.Promise = global.Promise;

const v1MongoDB = mongoose.createConnection(process.env.V1_MONGODB_URI as string).;
const apiMongoDB = mongoose.createConnection(process.env.API_MONGODB_URI as string);
const gameMongoDB = mongoose.createConnection(process.env.GAME_MONGODB_URI as string);

export { v1MongoDB, apiMongoDB, gameMongoDB, mongoose as default };

// // getting-started.js
// const mongoose = require("mongoose");

// main().catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect("mongodb://127.0.0.1:27017/test");

//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }

// const conn = mongoose.createConnection("mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]", options);

// # MONGODB_URI = "mongodb+srv://chukwuemeka:sm2018@smcluster1.bj62x.mongodb.net/SoccerMASS?retryWrites=true&w=majority"
