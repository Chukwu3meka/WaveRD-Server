import { Request, Response } from "express";

import { CONTACT_US } from "../../models/console";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["category", "comment"] });
    const { category, comment, email, mobile } = req.body;

    if (!["others", "advertising", "technical", "suggestion", "service"].includes(category)) throw { message: "Invalid category specified", client: true };

    if (!email && !mobile) throw { message: "Contact info not specified", client: true };

    await CONTACT_US.create({ category, comment, email, mobile });

    const data = { success: true, message: `Notice sent successfully`, payload: null };

    res.status(201).json(data);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
