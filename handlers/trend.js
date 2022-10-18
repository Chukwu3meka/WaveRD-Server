const Trends = require("../models/trend");
exports.insertTrend = async (req, res, next) => {
  try {
    const { soccermass, division, club, handle, category, title, body } = req.body;
    await Trends.create({
      soccermass,
      division,
      club,
      handle,
      category,
      title,
      body,
    });
    res.send("success");
  } catch (err) {
    return next({
      status: 400,
      message: "Error connecting to server",
    });
  }
};
