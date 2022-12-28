import * as redirect from "./redirect";
import * as v1 from "./v1";

export { redirect, v1 };

// v1

// module.exports = {
//   ...require("./profile"),
//   ...require("./club"),
//   ...require("./player"),
//   ...require("./mass"),
//   ...require("./admin"),
//   ...require("./trend"),
//   ...require("./oAuth"),
// };

// // module.exports.error = (err, req, res, next) => {
// //   return res.status(err.status || 500).json(err.message || err || "something went wrong.");
// // };
