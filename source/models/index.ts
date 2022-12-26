import mongoose from "mongoose";

const config = () => {
  console.log("Sadsa");

  if (!process.env.MONGODB_URI) throw { errMsg: "ENV MONGODB_URI Not definde" };

  mongoose.set("debug", true);
  mongoose.set("strictQuery", false);
  mongoose.Promise = global.Promise;
  mongoose
    .connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useFindAndModify: true,
      // useCreateIndex: true,
      // useUnifiedTopology: true,
      //
      // useNewUrlParser: true,
      // useFindAndModify: true,
      // useCreateIndex: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false,
    })
    .then(() => {
      console.log("MongoDB Connected Successfully");
    })
    .catch((err: any) => {
      console.assert(process.env.NODE === "production", `MongoDB Error: ${err}`);
    });
};

export default { config };
