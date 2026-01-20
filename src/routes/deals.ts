import express, { Request, Response, NextFunction } from 'express';
import { Deal } from '../models/Deal';
import { Property } from '../models/Property';
import { Company } from '../models/Company';
import { authenticateToken, requireRole } from '../middleware/auth';
import { prisma } from '../database';
import { parseMonthString } from '../utils/dateHelper';

const router = express.Router();

// Get deals with date/month filtering
router.get('/filter', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { brokerId, companyId, status, month, startDate, endDate } = req.query;

        // Build where clause
        const where: any = {};

        // Date filtering
        if (month) {
            // Format: YYYY-MM
            const { startDate: monthStart, endDate: monthEnd } = parseMonthString(month as string);
            where.createdAt = {
                gte: monthStart,
                lte: monthEnd
            };
        } else if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        } else if (startDate) {
            where.createdAt = {
                gte: new Date(startDate as string)
            };
        } else if (endDate) {
            where.createdAt = {
                lte: new Date(endDate as string)
            };
        }

        // Status filter
        if (status) {
            where.status = status;
        }

        // Broker filter
        if (brokerId) {
            if (req.user!.role === 'broker' && parseInt(brokerId as string) !== req.user!.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You can only view your own deals.'
                });
            }
            where.brokerId = parseInt(brokerId as string);
        } else if (req.user!.role === 'broker') {
            // Broker can only see their deals
            where.brokerId = req.user!.id;
        }

        // Company filter
        if (companyId) {
            where.companyId = parseInt(companyId as string);
        } else if (req.user!.companyId && req.user!.role !== 'admin') {
            where.companyId = req.user!.companyId;
        }

        // Fetch deals
        const deals = await prisma.deal.findMany({
            where,
            include: {
                property: true,
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                company: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate totals
        const totals = {
            totalDeals: deals.length,
            totalDealValue: 0,
            totalCommission: 0,
            totalCommissionValue: 0,
            totalBrokerShare: 0,
            totalCompanyShare: 0,
            byStatus: { open: 0, closed: 0, cancelled: 0 },
            byType: { sale: 0, rent: 0 }
        };

        deals.forEach(deal => {
            const dealValue = parseFloat((deal.dealValue as any) || (deal.salePrice as any) || 0);
            const commissionValue = parseFloat((deal.commissionValue as any) || 0);

            totals.totalDealValue += dealValue;
            totals.totalCommission += commissionValue;
            totals.totalCommissionValue += commissionValue;
            totals.totalBrokerShare += parseFloat((deal.brokerShare as any) || 0);
            totals.totalCompanyShare += parseFloat((deal.companyShare as any) || 0);

            if (deal.status === 'open') totals.byStatus.open++;
            else if (deal.status === 'closed') totals.byStatus.closed++;
            else if (deal.status === 'cancelled') totals.byStatus.cancelled++;

            if (deal.dealType === 'sale') (totals.byType as any).sale++;
            else if (deal.dealType === 'rent') (totals.byType as any).rent++;
        });

        res.json({
            success: true,
            filters: {
                month,
                startDate,
                endDate,
                brokerId,
                companyId,
                status
            },
            deals,
            totals
        });
    } catch (error) {
        console.error('Filter deals error:', error);
        next(error);
    }
});

// Get all deals (admin only) or filtered by brokerId/companyId/clientId
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { brokerId, companyId, clientId, status, company_id, month, startDate, endDate } = req.query;

        // Multi-tenant: Get company_id from user if available
        const userCompanyId = (req.user as any).company_id || req.user!.companyId;
        const filterCompanyId = companyId || company_id || (userCompanyId && req.user!.role !== 'admin' ? userCompanyId : null);

        // If user is not admin, they can only see their own deals (if broker) or deals from their company
        if (req.user!.role !== 'admin' && req.user!.role !== 'broker') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Only admins and brokers can view deals.'
            });
        }

        let deals: any[] = [];
        let totals = null;

        if (brokerId) {
            // Validate: brokers can only see their own deals unless admin
            if (req.user!.role === 'broker' && parseInt(brokerId as string) !== req.user!.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You can only view your own deals.'
                });
            }

            deals = await Deal.findByBroker(brokerId as string);
            totals = await Deal.getTotals(parseInt(brokerId as string), filterCompanyId ? parseInt(filterCompanyId.toString()) : null, (status as string) || null);
        } else if (clientId) {
            // Find deals by client
            deals = await Deal.findByClient(clientId as string);
            totals = await Deal.getTotals(null, filterCompanyId ? parseInt(filterCompanyId.toString()) : null, (status as string) || null);
        } else if (filterCompanyId) {
            // Filter by company (with multi-tenant support)
            if (req.user!.role !== 'admin' && userCompanyId && parseInt(filterCompanyId.toString()) !== userCompanyId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You can only view deals from your company.'
                });
            }

            deals = await Deal.findByCompany(filterCompanyId.toString());
            totals = await Deal.getTotals(null, parseInt(filterCompanyId.toString()), (status as string) || null);
        } else {
            // Get all deals (admin only) or filtered by user's company
            if (req.user!.role !== 'admin') {
                // For brokers, return only their deals
                deals = await Deal.findByBroker(req.user!.id);
                totals = await Deal.getTotals(req.user!.id, userCompanyId, (status as string) || null);
            } else {
                // Admin can see all deals or filter by company_id
                deals = await Deal.getAll({ companyId: filterCompanyId ? parseInt(filterCompanyId.toString()) : undefined });
                totals = await Deal.getTotals(null, filterCompanyId ? parseInt(filterCompanyId.toString()) : null, (status as string) || null);
            }
        }

        res.json({
            success: true,
            deals,
            totals
        });
    } catch (error) {
        console.error('Get deals error:', error);
        next(error);
    }
});

// Get deal by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deal = await Deal.findById(req.params.id as string);

        if (!deal) {
            return res.status(404).json({
                success: false,
                error: 'Deal not found'
            });
        }

        // Check permissions: brokers can only see their own deals
        if (req.user!.role === 'broker' && deal.broker_id !== req.user!.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only view your own deals.'
            });
        }

        // Multi-tenant: Ensure user can only see deals from their company
        const userCompanyId = (req.user as any).company_id || req.user!.companyId;
        if (userCompanyId && deal.company_id && deal.company_id !== userCompanyId && req.user!.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only view deals from your company.'
            });
        }

        res.json({
            success: true,
            deal
        });
    } catch (error) {
        console.error('Get deal by ID error:', error);
        next(error);
    }
});

// Create new deal
router.post('/', authenticateToken, requireRole(['admin', 'broker']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            propertyId,
            brokerId,
            companyId,
            clientId, // Optional
            clientName,
            dealType = 'sale', // sale or rent
            dealValue, // New primary field
            salePrice, // Backward compatibility
            commissionRate,
            status = 'open'
        } = req.body;

        // Use dealValue if provided, otherwise use salePrice (backward compatibility)
        const finalDealValue = dealValue || salePrice;

        // Validation - commission is optional for brokers (admin will set it later)
        if (!propertyId || !brokerId || !companyId || !clientName || !finalDealValue) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: propertyId, brokerId, companyId, clientName, dealValue (or salePrice)'
            });
        }

        // Commission rate is optional (admin will set it later if not provided)
        const hasCommission = commissionRate && parseFloat(commissionRate) > 0;

        // Validate dealType
        if (dealType && !['sale', 'rent'].includes(dealType)) {
            return res.status(400).json({
                success: false,
                error: 'dealType must be either "sale" or "rent"'
            });
        }

        // Validate status
        if (status && !['open', 'closed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'status must be one of: "open", "closed", "cancelled"'
            });
        }

        // Validate property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        // Validate broker exists and has correct role
        const broker = await prisma.user.findUnique({
            where: { id: parseInt(brokerId) }
        });

        if (!broker) {
            return res.status(404).json({
                success: false,
                error: 'Broker not found'
            });
        }

        if (broker.role !== 'broker' && broker.role !== 'admin') {
            return res.status(400).json({
                success: false,
                error: 'Selected user is not a broker'
            });
        }

        // Validate company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }

        // Validate commission rate (should be between 0 and 1, e.g., 0.05 for 5%)
        if (commissionRate < 0 || commissionRate > 1) {
            return res.status(400).json({
                success: false,
                error: 'Commission rate must be between 0 and 1 (e.g., 0.05 for 5%)'
            });
        }

        // Validate deal value
        if (finalDealValue <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Deal value must be greater than 0'
            });
        }

        // Multi-tenant: Auto-set companyId from user if not provided (for brokers)
        let finalCompanyId = companyId;
        if (!finalCompanyId && (req.user as any).company_id) {
            finalCompanyId = (req.user as any).company_id;
        } else if (!finalCompanyId && req.user!.companyId) {
            finalCompanyId = req.user!.companyId;
        }

        // For brokers, ensure companyId matches their company
        if (req.user!.role === 'broker' && (req.user as any).company_id && finalCompanyId && parseInt(finalCompanyId) !== (req.user as any).company_id) {
            return res.status(403).json({
                success: false,
                error: 'Brokers can only create deals for their own company'
            });
        }

        // If broker is creating deal, ensure they're creating it for themselves
        if (req.user!.role === 'broker' && parseInt(brokerId) !== req.user!.id) {
            return res.status(403).json({
                success: false,
                error: 'Brokers can only create deals for themselves'
            });
        }

        // Create deal (commission and shares are calculated automatically in Deal.create)
        const deal = await Deal.create({
            propertyId: parseInt(propertyId),
            brokerId: parseInt(brokerId),
            companyId: parseInt(finalCompanyId),
            clientId: clientId ? parseInt(clientId) : null,
            clientName,
            dealType,
            dealValue: parseFloat(finalDealValue),
            salePrice: parseFloat(finalDealValue), // Sync for backward compatibility
            commissionRate: commissionRate ? parseFloat(commissionRate) : undefined,
            status
        });

        res.status(201).json({
            success: true,
            message: 'Deal created successfully',
            deal
        });
    } catch (error) {
        console.error('Create deal error:', error);
        next(error);
    }
});

// Update deal (admin only, or broker for their own deals)
router.put('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deal = await Deal.findById(req.params.id as string);

        if (!deal) {
            return res.status(404).json({
                success: false,
                error: 'Deal not found'
            });
        }

        // Check permissions
        if (req.user!.role !== 'admin' && deal.broker_id !== req.user!.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only update your own deals.'
            });
        }

        // Multi-tenant: Ensure user can only update deals from their company
        const userCompanyId = (req.user as any).company_id || req.user!.companyId;
        if (userCompanyId && deal.company_id && deal.company_id !== userCompanyId && req.user!.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only update deals from your company.'
            });
        }

        const {
            clientName,
            clientId,
            dealType,
            dealValue,
            salePrice, // Backward compatibility
            commissionRate,
            status,
            dateClosed
        } = req.body;

        const updateData: any = {};

        if (clientName !== undefined) updateData.clientName = clientName;
        if (clientId !== undefined) updateData.clientId = clientId ? parseInt(clientId) : null;
        if (dealType !== undefined && ['sale', 'rent'].includes(dealType)) updateData.dealType = dealType;

        // Status update: admin can change any status, broker can only change their own deals
        if (status !== undefined && ['open', 'closed', 'cancelled'].includes(status)) {
            if (req.user!.role === 'admin' || deal.broker_id === req.user!.id) {
                updateData.status = status;
            }
        }

        // Date closed can be set by admin when closing deal
        if (dateClosed !== undefined && req.user!.role === 'admin') {
            updateData.dateClosed = dateClosed ? new Date(dateClosed) : null;
        }

        // If dealValue/salePrice or commissionRate changed, recalculate commission and shares
        const finalDealValue = dealValue !== undefined
            ? parseFloat(dealValue)
            : (salePrice !== undefined ? parseFloat(salePrice) : null);

        if (finalDealValue !== null || commissionRate !== undefined) {
            const existingDeal = await prisma.deal.findUnique({ where: { id: parseInt(req.params.id as string) } });
            if (existingDeal) {
                const calculatedDealValue = finalDealValue !== null ? finalDealValue : Number(existingDeal.dealValue) || Number(existingDeal.salePrice);
                const calculatedCommissionRate = commissionRate !== undefined ? parseFloat(commissionRate) : Number(existingDeal.commissionRate);

                updateData.dealValue = calculatedDealValue;
                updateData.salePrice = calculatedDealValue; // Sync for backward compatibility
                updateData.commissionRate = calculatedCommissionRate;
                // commissionValue, brokerShare, companyShare will be recalculated in Deal.update()
            }
        }

        await deal.update(updateData);

        const updatedDeal = await Deal.findById(req.params.id as string);

        res.json({
            success: true,
            message: 'Deal updated successfully',
            deal: updatedDeal
        });
    } catch (error) {
        console.error('Update deal error:', error);
        next(error);
    }
});

// Delete deal (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deal = await Deal.findById(req.params.id as string);

        if (!deal) {
            return res.status(404).json({
                success: false,
                error: 'Deal not found'
            });
        }

        await deal.delete();

        res.json({
            success: true,
            message: 'Deal deleted successfully'
        });
    } catch (error) {
        console.error('Delete deal error:', error);
        next(error);
    }
});

export default router;
