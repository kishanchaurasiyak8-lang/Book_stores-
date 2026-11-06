import { ZodError } from "zod";

export function validateBody(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }
      next(err);
    }
  };
}

export function validateQuery(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      for (const key of Object.keys(parsed)) {
        req.query[key] = parsed[key];
      }
      req.validatedQuery = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors,
        });
      }
      next(err);
    }
  };
}
