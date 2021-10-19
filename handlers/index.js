module.exports = {
  ...require("./profiles"),
  ...require("./clubs"),
  ...require("./players"),
  ...require("./masses"),
  ...require("./admin"),
  ...require("./trends"),
  ...require("./oAuth"),
};

// module.exports.error = (err, req, res, next) => {
//   return res.status(err.status || 500).json(err.message || err || "something went wrong.");
// };
