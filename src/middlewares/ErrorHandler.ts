import type { Request, Response, NextFunction } from "express";
import { CustomError, HttpStatusCodes } from "../utils/HttpExceptions";

const ErrorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CustomError) {
    const { statusCode, stack, isLogging, errors } = err;
    if (isLogging) {
      const logMessage = JSON.stringify({ statusCode, errors, stack }, null, 2);
      console.log(logMessage);
    }
    return res.status(statusCode).send({ errors });
  }
  console.log(JSON.stringify(`Unhandled error: ${err}`, null, 2));
  return res
    .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
    .send({ errors: [{ message: "Something went wrong" }] });
};

export default ErrorHandler;
