const mongoose = require("mongoose");

mongoose.set("debug", true);
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true,
    // useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .catch((err) => {
    console.log(`Error From MongoDB: ${err}`);
  });
