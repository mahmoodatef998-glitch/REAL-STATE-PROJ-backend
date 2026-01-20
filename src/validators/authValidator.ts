import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Register validation rules
export const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6, max: 100 }).withMessage('Password must be between 6 and 100 characters'),

    body('role')
        .optional()
        .isIn(['broker', 'client', 'admin']).withMessage('Invalid role'),

    body('phone')
        .optional()
        .custom((value, { req }) => {
            // Phone is required for brokers
            const role = req.body?.role;
            if (role === 'broker' && !value) {
                throw new Error('Phone number is required for brokers');
            }
            return true;
        })
        .isLength({ max: 20 }).withMessage('Phone number is too long'),

    body('whatsapp')
        .optional()
        .isLength({ max: 20 }).withMessage('WhatsApp number is too long'),
];

// Login validation rules
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 1 }).withMessage('Password is required'),
];

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
