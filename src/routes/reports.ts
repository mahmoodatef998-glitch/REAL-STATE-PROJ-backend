import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
    calculateMonthlyBrokerCommission,
    calculateMonthlyCompanyIncome,
    getBrokerCommissionHistory,
    getCompanyIncomeHistory,
    compareBrokerMonths
} from '../utils/commissionCalculator';
import { getCurrentMonthRange, getLastNMonths } from '../utils/dateHelper';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Get monthly commission report for broker
 * GET /api/reports/broker/monthly
 * Query params: year, month, brokerId (admin only)
 */
router.get('/broker/monthly', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { year, month, brokerId } = req.query as { year?: string, month?: string, brokerId?: string };

        // If broker, can only see their own data
        if (req.user!.role === 'broker') {
            brokerId = req.user!.id.toString();
        } else if (!brokerId) {
            // Admin must specify brokerId
            return res.status(400).json({
                success: false,
                error: 'brokerId is required for admin users'
            });
        }

        // Default to current month if not specified
        if (!year || !month) {
            const { year: currentYear, month: currentMonth } = getCurrentMonthRange();
            year = year || currentYear.toString();
            month = month || currentMonth.toString();
        }

        const report = await calculateMonthlyBrokerCommission(
            parseInt(brokerId!),
            parseInt(year!),
            parseInt(month!)
        );

        logger.info(`Monthly broker report generated`, {
            brokerId,
            year,
            month,
            totalCommission: report.summary.totalBrokerShare
        });

        res.json({
            success: true,
            report
        });
    } catch (error) {
        logger.error('Error generating broker monthly report:', error);
        next(error);
    }
});

/**
 * Get broker commission history (multiple months)
 * GET /api/reports/broker/history
 * Query params: brokerId (admin only), months (default: 12)
 */
router.get('/broker/history', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { brokerId, months } = req.query as { brokerId?: string, months?: string };

        // If broker, can only see their own data
        if (req.user!.role === 'broker') {
            brokerId = req.user!.id.toString();
        } else if (!brokerId) {
            return res.status(400).json({
                success: false,
                error: 'brokerId is required for admin users'
            });
        }

        const monthsCount = months ? parseInt(months) : 12;

        const history = await getBrokerCommissionHistory(
            parseInt(brokerId!),
            monthsCount
        );

        logger.info(`Broker commission history retrieved`, {
            brokerId,
            months: monthsCount
        });

        res.json({
            success: true,
            brokerId: parseInt(brokerId!),
            months: monthsCount,
            history
        });
    } catch (error) {
        logger.error('Error retrieving broker history:', error);
        next(error);
    }
});

/**
 * Compare current month with previous month for broker
 * GET /api/reports/broker/compare
 * Query params: brokerId (admin only)
 */
router.get('/broker/compare', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { brokerId } = req.query as { brokerId?: string };

        // If broker, can only see their own data
        if (req.user!.role === 'broker') {
            brokerId = req.user!.id.toString();
        } else if (!brokerId) {
            return res.status(400).json({
                success: false,
                error: 'brokerId is required for admin users'
            });
        }

        const comparison = await compareBrokerMonths(parseInt(brokerId!));

        logger.info(`Monthly comparison generated for broker`, {
            brokerId,
            change: comparison.change
        });

        res.json({
            success: true,
            brokerId: parseInt(brokerId!),
            comparison
        });
    } catch (error) {
        logger.error('Error generating broker comparison:', error);
        next(error);
    }
});

/**
 * Get monthly income report for company (Admin only)
 * GET /api/reports/company/monthly
 * Query params: year, month, companyId (optional)
 */
router.get('/company/monthly', authenticateToken, requireRole(['admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { year, month, companyId } = req.query as { year?: string, month?: string, companyId?: string };

        // Default to current month if not specified
        if (!year || !month) {
            const { year: currentYear, month: currentMonth } = getCurrentMonthRange();
            year = year || currentYear.toString();
            month = month || currentMonth.toString();
        }

        // Use user's company if they have one
        if (!companyId && (req.user as any).companyId) { // user.companyId is available from token usually or db
            // But my expanded Request type has companyId?
            // Let's assume req.user might have it if added by middleware.
            // In my type def I added companyId to Request, but not specifically to User.
            // But auth middleware populates req.user.
            // Let's use string cast to be safe if types differ
            companyId = ((req.user as any).companyId || req.user!.companyId || '').toString();
            if (companyId === '') companyId = undefined; // reset if empty
        }

        const report = await calculateMonthlyCompanyIncome(
            companyId ? parseInt(companyId) : null,
            parseInt(year!),
            parseInt(month!)
        );

        logger.info(`Monthly company report generated`, {
            companyId,
            year,
            month,
            netIncome: report.summary.netIncome
        });

        res.json({
            success: true,
            report
        });
    } catch (error) {
        logger.error('Error generating company monthly report:', error);
        next(error);
    }
});

/**
 * Get company income history (multiple months) - Admin only
 * GET /api/reports/company/history
 * Query params: companyId (optional), months (default: 12)
 */
router.get('/company/history', authenticateToken, requireRole(['admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { companyId, months } = req.query as { companyId?: string, months?: string };

        // Use user's company if they have one
        if (!companyId && (req.user as any).companyId) {
            companyId = ((req.user as any).companyId || req.user!.companyId || '').toString();
            if (companyId === '') companyId = undefined;
        }

        const monthsCount = months ? parseInt(months) : 12;

        const history = await getCompanyIncomeHistory(
            companyId ? parseInt(companyId) : null,
            monthsCount
        );

        logger.info(`Company income history retrieved`, {
            companyId,
            months: monthsCount
        });

        res.json({
            success: true,
            companyId: companyId ? parseInt(companyId) : null,
            months: monthsCount,
            history
        });
    } catch (error) {
        logger.error('Error retrieving company history:', error);
        next(error);
    }
});

/**
 * Get available months list
 * GET /api/reports/months
 * Query params: count (default: 12)
 */
router.get('/months', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const count = req.query.count ? parseInt(req.query.count as string) : 12;
        const months = getLastNMonths(count);

        res.json({
            success: true,
            count: months.length,
            months: months.map(m => ({
                year: m.year,
                month: m.month,
                label: m.label,
                labelAr: m.labelAr
            }))
        });
    } catch (error) {
        logger.error('Error retrieving months list:', error);
        next(error);
    }
});

/**
 * Get dashboard summary with current month stats
 * GET /api/reports/dashboard
 */
router.get('/dashboard', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { year: currentYear, month: currentMonth } = getCurrentMonthRange();

        let brokerReport: any = null;
        let companyReport: any = null;

        // If broker, get their stats
        if (req.user!.role === 'broker') {
            brokerReport = await calculateMonthlyBrokerCommission(
                req.user!.id,
                currentYear,
                currentMonth
            );

            // Get comparison with previous month
            const comparison = await compareBrokerMonths(req.user!.id);
            brokerReport.comparison = comparison.change;
        }

        // If admin, get company stats
        if (req.user!.role === 'admin') {
            const companyId = req.user!.companyId || null;
            companyReport = await calculateMonthlyCompanyIncome(
                companyId,
                currentYear,
                currentMonth
            );
        }

        logger.info(`Dashboard summary generated`, {
            userId: req.user!.id,
            role: req.user!.role
        });

        res.json({
            success: true,
            currentMonth: {
                year: currentYear,
                month: currentMonth
            },
            broker: brokerReport,
            company: companyReport
        });
    } catch (error) {
        logger.error('Error generating dashboard summary:', error);
        next(error);
    }
});

/**
 * Get all brokers monthly performance (Admin only)
 * GET /api/reports/brokers/performance
 * Query params: year, month
 */
router.get('/brokers/performance', authenticateToken, requireRole(['admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { year, month, companyId } = req.query as { year?: string, month?: string, companyId?: string };

        // Default to current month
        if (!year || !month) {
            const { year: currentYear, month: currentMonth } = getCurrentMonthRange();
            year = year || currentYear.toString();
            month = month || currentMonth.toString();
        }

        // Use user's company if they have one
        if (!companyId && (req.user as any).companyid) {
            companyId = ((req.user as any).companyId || req.user!.companyId || '').toString();
            if (companyId === '') companyId = undefined;
        }

        // Get company report which includes broker performance
        const report = await calculateMonthlyCompanyIncome(
            companyId ? parseInt(companyId) : null,
            parseInt(year!),
            parseInt(month!)
        );

        res.json({
            success: true,
            year: parseInt(year!),
            month: parseInt(month!),
            topBrokers: report.topBrokers,
            summary: {
                totalBrokers: report.topBrokers.length,
                totalDeals: report.summary.totalDeals,
                totalCommission: report.summary.totalCommission,
                averagePerBroker: report.topBrokers.length > 0
                    ? report.summary.totalCommission / report.topBrokers.length
                    : 0
            }
        });
    } catch (error) {
        logger.error('Error generating brokers performance report:', error);
        next(error);
    }
});

export default router;
