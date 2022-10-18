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

// module.exports = () => require("./emotion");

// module.exports = async ()

// const cron = require("node-cron");

// const dailyTask = require("./dailyTask");
// const energyTask = require("./energyTask");
// const injuryTask = require("./injuryTask");
// const emotionTask = require("./emotionTask");
// const playMatch = require("./playMatch");

// console.log("************  Auto SocceMASS task has started  ********************");
// // // every second task *** for testing purpose only
// // cron.schedule("* * * * *", daily Task());

// // daily task @ 2:30 - 4am
// cron.schedule("20 2 * * *", energyTask());
// cron.schedule("40 2 * * *", injuryTask());
// cron.schedule("0 3 * * *", playMatch());
// // weekly task on saturday
// cron.schedule("0 2 * * 6", emotionTask());
