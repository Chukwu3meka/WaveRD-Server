import { NextFunction, Request, Response } from "express";

export const serverHomePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.writeHead(200);

    res.writeHead(200);
    res.send("authors");
    res.send("authors");
    res.end("authors");

    return res.status(200).json("masses");
  } catch (err) {
    // return catchError({ next, err, message: "unable to locate masses" });
  }
};

// if homepage is invoked, redirect user to SoccerMASS Web
// app.use("/", (req: Request, res: Response) => res.redirect(301, process.env.CLIENT || ""));
// app.use("/v1", (req: Request, res: Response) => res.redirect(301, process.env.CLIENT || ""));
// app.use("/api", (req: Request, res: Response) => res.redirect(301, process.env.CLIENT || ""));
