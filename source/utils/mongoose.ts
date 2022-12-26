import mongoose from "mongoose";

const config = () => {
  mongoose.set("debug", true);
  mongoose.set("strictQuery", false);
  mongoose.Promise = global.Promise;
  mongoose
    .connect(process.env.MONGODB_URI as string, {
      // useNewUrlParser: true,
      // useCreateIndex: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false,
    })
    .then(() => {
      console.log("MongoDB Connected Successfully");
    })
    .catch((err: any) => {
      throw { message: `MongoDB Error: ${err}` };
    });
};

export default { config };
