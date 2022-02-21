const cron = require("node-cron");
const dailyTask = require("./dailyTask");
const matchTask = require("./matchTask");
const weeklyTask = require("./weeklyTask");

// ***** All task run at 13min ****** //

// run daily task
cron.schedule("13 1 * * *", () => {
  dailyTask();
});

// run match task on Monday, Wednessday and Saturday
cron.schedule("13 3 * * 1,3,6", () => {
  matchTask();
});

// run weekly task on Fridays
cron.schedule("13 5 * * 5", () => {
  weeklyTask();
});

// cron.schedule("0-59 * * * * *", () => {
//   // const val = cron.validate("0 * * * * *");
//   // dailyTask();
//   console.log("running a task every second", new Date().toDateString());
// });
