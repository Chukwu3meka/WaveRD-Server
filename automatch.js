const MongoURI = process.env.MONGODB_URI;
const mongoose = require("mongoose");

mongoose.set("debug", true);
mongoose.Promise = global.Promise;
mongoose
  .connect(MongoURI, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .catch((err) => {
    if (process.env.NODE_ENV !== "production") console.log(`Error From MongoDB: ${err}`);
  });

async function autorun() {
  const autoMatch = require("./source/autorun/playMatch");
  await autoMatch();
  process.exit();
}

autorun();
