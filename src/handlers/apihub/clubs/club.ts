import { NextFunction, Request, Response } from "express";

import { CLUBS } from "../../../models/apihub";
import { catchError, requestHasBody } from "../../../utils/handlers";
// import { isValidObjectId } from "mongoose";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.params, required: ["id"] });
    const { id } = req.params;

    // // 63e54d3215e0ae5734cce9bc
    // const isClubIDValid = isValidObjectId(id);
    // if (!isClubIDValid) throw { message: `Invalid Club ID provided`, error: true };

    // return await CLUBS.findById(id)
    //   .then((clubData) => {
    //     if (!clubData) throw { message: `No club was located with the ID: '${id}'.` };

    //     const data = { success: true, message: `Club data for ${clubData.title} found}`, data: clubData };
    //     return res.status(200).json(data);
    //   })
    //   .catch(() => {
    //     throw { message: `The club with ID: '${id}' may have been deleted or may not exist.` };
    //   });

    // const a = await CLUBS.deleteMany(clubs);

    res.status(200).json("a");
  } catch (err: any) {
    return catchError({ res, err });
  }
};

//  await CLUBS.insertMany(clubs);
//  await CLUBS.deleteMany(clubs);
