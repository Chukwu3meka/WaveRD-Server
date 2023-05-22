import { Request, Response } from "express";

import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  const data = { success: true, message: `Success`, payload: null };

  try {
    res.status(201).json(data);
  } catch (err: any) {
    res.status(201).json(data);

    err.respond = false;
    return catchError({ res, err });
  }
};
