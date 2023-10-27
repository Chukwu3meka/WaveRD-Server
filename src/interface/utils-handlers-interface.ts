import { Response } from "express";

export interface CatchError {
  err: any;
  req?: Request;
  res: Response;
}
