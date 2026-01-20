import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database';

/**
 * Middleware to enforce tenant isolation
 * Automatically filters queries by companyId
 * 
 * Super Admin (admin without companyId) can see all data
 * Regular users can only see their company's data
 */
export const tenantIsolation = async (req: Request, res: Response, next: NextFunction) => {
    // Super Admin (admin without companyId) can see all data
    if (req.user && req.user.role === 'admin' && !req.user.companyId) {
        req.isSuperAdmin = true;
        return next();
    }

    // Set tenant ID from user's company
    if (req.user && req.user.companyId) {
        req.tenantId = req.user.companyId;
        req.isSuperAdmin = false;
    }

    next();
};

/**
 * Middleware to check if user has access to a specific resource
 * Verifies that the resource belongs to the user's company
 */
export const checkTenantAccess = async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.id || req.body.id;
    const resourceType = req.resourceType || 'property';

    if (!resourceId) {
        return next();
    }

    // Super Admin can access all resources
    if (req.user && req.user.role === 'admin' && !req.user.companyId) {
        return next();
    }

    // Map resource types to Prisma models
    // Using explicit type mapping or just leveraging the prisma client
    const modelName = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
    const model = (prisma as any)[resourceType] || (prisma as any)[modelName.toLowerCase()]; // Basic resolution

    if (!model) {
        return next();
    }

    try {
        const resource = await model.findUnique({
            where: { id: parseInt(resourceId) },
            select: { companyId: true }
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Resource not found'
            });
        }

        // Check if resource belongs to user's company
        if (resource.companyId !== req.user?.companyId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Resource does not belong to your company.'
            });
        }

        next();
    } catch (error) {
        console.error('Tenant access check error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error checking resource access'
        });
    }
};

/**
 * Helper function to build where clause with tenant isolation
 */
export const buildTenantWhere = (req: Request, additionalWhere: any = {}) => {
    const where = { ...additionalWhere };

    // Super Admin can see all
    if (req.isSuperAdmin) {
        return where;
    }

    // Regular users can only see their company's data
    if (req.tenantId) {
        where.companyId = req.tenantId;
    }

    return where;
};
