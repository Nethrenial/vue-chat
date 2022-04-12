import { RequestHandler } from "express";

export const logger: RequestHandler = (req, res, next) => {
  console.log("logged");
  next();
};
