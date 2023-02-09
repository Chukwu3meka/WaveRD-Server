import { NextFunction, Request, Response } from "express";

import validator from "../../../utils/validator";
import { PROFILE } from "../../../models/accounts";
import { catchError, requestHasBody } from "../../../utils/handlers";

export const emailExistsFn = async (email: string) => {
  validator({ type: "email", value: email });

  const dbResponse = await PROFILE.findOne({ email: email.toLowerCase() });

  return !!dbResponse;
};

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    var cookie = req.headers.cookie;
    console.log(cookie);
    // res.send('Cookie value: ' + cookie);

    console.log(`



    "req.cookies"
    
    ${req.headers.cookie}


    ${JSON.stringify(req.cookies)}

    ${JSON.stringify(req.cookies.SoccerMASS)}
    


`);
    // ${req.cookies}

    requestHasBody({ body: req.body, required: ["email"] });
    const { email } = req.body;

    const emailExists = await emailExistsFn(email);

    const data = { success: true, message: `${email} is ${emailExists ? "taken" : "available"}`, payload: { exists: emailExists } };
    res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
