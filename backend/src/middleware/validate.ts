import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Express-validator middleware to check validation results
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors: Record<string, string[]> = {};
    errors.array().forEach((error) => {
      if (error.type === "field") {
        const field = error.path;
        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }
        formattedErrors[field].push(error.msg);
      }
    });

    throw new ValidationError(formattedErrors);
  };
};

/**
 * Zod validation middleware
 */
export const validateZod = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = (validated as { body?: unknown }).body ?? req.body;
      req.query = ((validated as { query?: unknown }).query ??
        req.query) as Request["query"];
      req.params = ((validated as { params?: unknown }).params ??
        req.params) as Request["params"];

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });
        throw new ValidationError(formattedErrors);
      }
      throw error;
    }
  };
};
