import mongoose from "mongoose";

if (!process.env.MONGODB_URI) throw { errMsg: "ENV MONGODB_URI Not definde" };

mongoose.set("debug", true);
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
    console.log(`MongoDB Error: ${err}`);
  });
