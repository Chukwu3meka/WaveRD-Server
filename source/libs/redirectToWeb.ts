import { Request, Response } from "express";

export default async (req: Request, res: Response) => res.writeHead(302, { Location: process.env.CLIENT_BASE_URL }).end();
