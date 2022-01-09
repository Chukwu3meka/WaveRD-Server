const logger = require("heroku-logger");

module.exports = async () => {
  logger.info("message", { key: "direct" });
};
