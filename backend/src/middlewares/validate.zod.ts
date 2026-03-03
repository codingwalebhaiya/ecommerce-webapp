import  { ZodSchema } from "zod";
import   { Request, Response, NextFunction } from "express";

const validate =
  (schema: ZodSchema<any>, source: "body" | "params" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(
        new Error(result.error.issues.map(i => i.message).join(", "))
      );
    }

    req[source] = result.data;
    next();
  };

export default validate;
