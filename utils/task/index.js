const cron = require("node-cron");

cron.schedule("10-15 * * * * *", () => {
  console.log("running a task every second", new Date());
});
