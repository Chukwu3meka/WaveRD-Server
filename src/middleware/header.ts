// Middleware to disable search engine indexing

import { Request, Response, NextFunction } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
  res.header("X-Robots-Tag", "noindex, nofollow");
  next();
};
