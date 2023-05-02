import { Response } from "express";

export interface CatchError {
  err: any;
  res: Response;
}
