import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Property creation/update validation rules
export const validateProperty = [
    body('title')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),

    body('description')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 10000 }).withMessage('Description is too long'),

    body('type')
        .optional({ checkFalsy: true }),

    body('purpose')
        .optional({ checkFalsy: true }),

    body('price')
        .optional({ checkFalsy: true }),

    body('area_sqft')
        .optional({ checkFalsy: true }),

    body('bedrooms')
        .optional({ checkFalsy: true }),

    body('bathrooms')
        .optional({ checkFalsy: true }),

    body('emirate')
        .optional({ checkFalsy: true })
        .trim(),

    body('location')
        .optional({ checkFalsy: true })
        .trim(),

    body('images')
        .optional({ checkFalsy: true }),

    body('features')
        .optional({ checkFalsy: true }),

    body('status')
        .optional({ checkFalsy: true }),
];

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn(`Validation failed for ${req.method} ${req.url}:`, {
            errors: errors.array(),
            body: req.body,
            files: req.files ? (req.files as any[]).length : 0
        });

        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: (err as any).path || (err as any).param,
                message: err.msg
            }))
        });
    }
    next();
};
