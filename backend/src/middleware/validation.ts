import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@project/shared/constants';

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export function validate(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const body = req.body as Record<string, unknown>;

    for (const rule of rules) {
      const value = body[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message ?? `${rule.field} is required`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rule.type && typeof value !== rule.type) {
        errors.push(rule.message ?? `${rule.field} must be a ${rule.type}`);
        continue;
      }

      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(
            rule.message ?? `${rule.field} must be at least ${rule.minLength} characters`,
          );
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(
            rule.message ?? `${rule.field} must be at most ${rule.maxLength} characters`,
          );
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(rule.message ?? `${rule.field} has an invalid format`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        error: 'Validation Error',
        message: errors.join('; '),
        statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      });
      return;
    }

    next();
  };
}
