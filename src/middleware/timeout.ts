import { Response, Request, NextFunction } from "express";

export default (seconds: number) => async (req: Request, res: Response, next: NextFunction) => {
  const requestTimeout = setTimeout(() => {
    if (!res.headersSent) res.emit("timeout");
  }, seconds * 60 * 60);

  // Clear the timeout if the request is finished before the timeout
  res.on("finish", () => {
    // console.log("Request completed before Timout");
    clearTimeout(requestTimeout);
  });

  res.on("timeout", () => {
    res.status(504).send("Request Timeout");
  });

  next();
};
