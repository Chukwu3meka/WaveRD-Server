// runs at 1:00am UTC

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
  .catch((err) => console.log(`Error From MongoDB: ${err}`));

async function autorun() {
  // const energyTask = require("./source/autorun/energyTask");
  // const injuryTask = require("./source/autorun/injuryTask");
  // const emotionTask = require("./source/autorun/emotionTask");
  // await energyTask();
  // await injuryTask();
  // await emotionTask();
  process.exit();
}

autorun();
