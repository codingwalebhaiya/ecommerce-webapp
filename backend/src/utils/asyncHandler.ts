import type { Request, Response, NextFunction } from "express";

type RequestHandlerAsync = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

const asyncHandler =
  (requestHandler: RequestHandlerAsync) =>
  (req: Request, res: Response, next: NextFunction ): void => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };

export default asyncHandler;



// import type { Request, Response, NextFunction } from "express";

// type AsyncHandlerFn = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => Promise<unknown>;

// const asyncHandler =
//   (fn: AsyncHandlerFn) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await fn(req, res, next);
//     } catch (err) {
//       const error = err as Error & { statusCode?: number };

//       res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   };

// export default asyncHandler;
