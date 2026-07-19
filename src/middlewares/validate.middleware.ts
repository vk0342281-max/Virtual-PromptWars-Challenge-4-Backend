import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendBadRequest } from '../utils/response';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Validates request data against a Zod schema.
 *
 * Usage: validate(myZodSchema)  — validates req.body by default
 *        validate(myZodSchema, 'query')  — validates req.query
 */
export function validate(schema: AnyZodObject, target: ValidateTarget = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      // Replace req data with parsed/transformed values (strips extra fields)
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        sendBadRequest(res, `Validation failed: ${errors[0]}`, errors.join('; '));
        return;
      }
      next(err);
    }
  };
}
