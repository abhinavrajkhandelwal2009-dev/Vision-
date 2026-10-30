import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['operator', 'inspector', 'admin']).optional().default('operator')
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const inspectionRequestSchema = z.object({
  domain: z.string().min(2, 'Domain must be specified (e.g. Industrial Manufacturing, Safety Hazard, Quality Control)'),
  imageBase64: z.string().min(10, 'A valid base64 image payload is required'),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/i, 'Only JPEG, PNG, and WebP images are supported'),
  threshold: z.number().min(0).max(100).optional().default(60),
  operatorNotes: z.string().optional()
});

export const updateInspectionSchema = z.object({
  status: z.enum(['pending', 'passed', 'failed', 'flagged_for_review']).optional(),
  operator_notes: z.string().optional()
});

/**
 * Middleware factory for validating incoming request body against a Zod schema
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      req.validatedBody = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ error: 'Invalid request body' });
    }
  };
}

