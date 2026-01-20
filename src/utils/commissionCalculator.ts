import { prisma } from '../database';
import { getMonthDateRange } from './dateHelper';

interface DealsByStatus {
    open: number;
    closed: number;
    cancelled: number;
    [key: string]: number;
}

interface DealsByType {
    sale: number;
    rent: number;
    [key: string]: number;
}

/**
 * Calculate monthly commission for a broker
 */
export async function calculateMonthlyBrokerCommission(brokerId: number, year: number, month: number) {
    const { startDate, endDate } = getMonthDateRange(year, month);

    // Get all deals for this broker in this month
    const deals = await prisma.deal.findMany({
        where: {
            brokerId: Number(brokerId),
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            property: {
                select: {
                    id: true,
                    title: true,
                    type: true
                }
            }
        }
    });

    // Calculate totals
    let totalDeals = deals.length;
    let totalDealValue = 0;
    let totalCommission = 0;
    let totalBrokerShare = 0;
    let approvedCommission = 0;
    let pendingCommission = 0;

    const dealsByStatus: DealsByStatus = {
        open: 0,
        closed: 0,
        cancelled: 0
    };

    const dealsByType: DealsByType = {
        sale: 0,
        rent: 0
    };

    deals.forEach(deal => {
        const dealValue = parseFloat((deal.dealValue as any) || (deal.salePrice as any) || 0);
        const commission = parseFloat((deal.commissionValue as any) || 0);
        const brokerShare = parseFloat((deal.brokerShare as any) || 0);

        totalDealValue += dealValue;
        totalCommission += commission;
        totalBrokerShare += brokerShare;

        // Track approved vs pending
        if (deal.commissionApproved) {
            approvedCommission += brokerShare;
        } else {
            pendingCommission += brokerShare;
        }

        // Count by status
        if (dealsByStatus.hasOwnProperty(deal.status)) {
            dealsByStatus[deal.status]++;
        }

        // Count by type
        if (dealsByType.hasOwnProperty(deal.dealType)) {
            dealsByType[deal.dealType]++;
        }
    });

    return {
        brokerId: Number(brokerId),
        year,
        month,
        period: {
            startDate,
            endDate
        },
        summary: {
            totalDeals,
            totalDealValue,
            totalCommission,
            totalBrokerShare,
            approvedCommission,
            pendingCommission,
            averageDealValue: totalDeals > 0 ? totalDealValue / totalDeals : 0,
            averageCommission: totalDeals > 0 ? totalBrokerShare / totalDeals : 0
        },
        breakdown: {
            byStatus: dealsByStatus,
            byType: dealsByType
        },
        deals: deals.map(deal => ({
            id: deal.id,
            property: deal.property,
            clientName: deal.clientName,
            dealType: deal.dealType,
            dealValue: (deal.dealValue as any) || (deal.salePrice as any),
            brokerShare: deal.brokerShare,
            commissionApproved: deal.commissionApproved,
            status: deal.status,
            createdAt: deal.createdAt
        }))
    };
}

/**
 * Calculate monthly income for company (Admin view)
 */
export async function calculateMonthlyCompanyIncome(companyId: number | null, year: number, month: number) {
    const { startDate, endDate } = getMonthDateRange(year, month);

    const whereClause: any = {
        createdAt: {
            gte: startDate,
            lte: endDate
        }
    };

    if (companyId) {
        whereClause.companyId = Number(companyId);
    }

    // Get all deals for this period
    const deals = await prisma.deal.findMany({
        where: whereClause,
        include: {
            broker: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            property: {
                select: {
                    id: true,
                    title: true,
                    type: true
                }
            },
            company: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    // Calculate totals
    let totalDeals = deals.length;
    let totalDealValue = 0;
    let totalCommission = 0;
    let totalCompanyShare = 0;
    let totalBrokerShare = 0;
    let netIncome = 0; // Company's share after broker commission

    const dealsByStatus: DealsByStatus = {
        open: 0,
        closed: 0,
        cancelled: 0
    };

    const dealsByType: DealsByType = {
        sale: 0,
        rent: 0
    };

    const brokerPerformance: any = {};

    deals.forEach(deal => {
        const dealValue = parseFloat((deal.dealValue as any) || (deal.salePrice as any) || 0);
        const commission = parseFloat((deal.commissionValue as any) || 0);
        const companyShare = parseFloat((deal.companyShare as any) || 0);
        const brokerShare = parseFloat((deal.brokerShare as any) || 0);

        totalDealValue += dealValue;
        totalCommission += commission;
        totalCompanyShare += companyShare;
        totalBrokerShare += brokerShare;
        netIncome += companyShare;

        // Count by status
        if (dealsByStatus.hasOwnProperty(deal.status)) {
            dealsByStatus[deal.status]++;
        }

        // Count by type
        if (dealsByType.hasOwnProperty(deal.dealType)) {
            dealsByType[deal.dealType]++;
        }

        // Track broker performance
        const brokerId = deal.brokerId;
        if (!brokerPerformance[brokerId]) {
            brokerPerformance[brokerId] = {
                broker: deal.broker,
                totalDeals: 0,
                totalDealValue: 0,
                totalCommission: 0,
                brokerShare: 0,
                companyShare: 0
            };
        }

        brokerPerformance[brokerId].totalDeals++;
        brokerPerformance[brokerId].totalDealValue += dealValue;
        brokerPerformance[brokerId].totalCommission += commission;
        brokerPerformance[brokerId].brokerShare += brokerShare;
        brokerPerformance[brokerId].companyShare += companyShare;
    });

    // Convert broker performance to array
    const topBrokers = Object.values(brokerPerformance)
        .sort((a: any, b: any) => b.totalDealValue - a.totalDealValue)
        .slice(0, 10);

    return {
        companyId: companyId || null,
        year,
        month,
        period: {
            startDate,
            endDate
        },
        summary: {
            totalDeals,
            totalDealValue,
            totalCommission,
            totalCompanyShare,
            totalBrokerShare,
            netIncome,
            averageDealValue: totalDeals > 0 ? totalDealValue / totalDeals : 0,
            averageCommission: totalDeals > 0 ? totalCommission / totalDeals : 0,
            profitMargin: totalDealValue > 0 ? (netIncome / totalDealValue) * 100 : 0
        },
        breakdown: {
            byStatus: dealsByStatus,
            byType: dealsByType
        },
        topBrokers
    };
}

/**
 * Get broker commission history (all months)
 */
export async function getBrokerCommissionHistory(brokerId: number, months: number = 12) {
    const history = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const monthData = await calculateMonthlyBrokerCommission(brokerId, year, month);
        history.push(monthData);
    }

    return history;
}

/**
 * Get company income history (all months)
 */
export async function getCompanyIncomeHistory(companyId: number | null, months: number = 12) {
    const history = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const monthData = await calculateMonthlyCompanyIncome(companyId, year, month);
        history.push(monthData);
    }

    return history;
}

/**
 * Compare current month with previous month
 */
export async function compareBrokerMonths(brokerId: number) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const previousDate = new Date(currentYear, currentMonth - 2, 1);
    const previousYear = previousDate.getFullYear();
    const previousMonth = previousDate.getMonth() + 1;

    const current = await calculateMonthlyBrokerCommission(brokerId, currentYear, currentMonth);
    const previous = await calculateMonthlyBrokerCommission(brokerId, previousYear, previousMonth);

    const change = {
        deals: current.summary.totalDeals - previous.summary.totalDeals,
        dealValue: current.summary.totalDealValue - previous.summary.totalDealValue,
        commission: current.summary.totalBrokerShare - previous.summary.totalBrokerShare,
        dealsPercent: previous.summary.totalDeals > 0
            ? ((current.summary.totalDeals - previous.summary.totalDeals) / previous.summary.totalDeals) * 100
            : 0,
        commissionPercent: previous.summary.totalBrokerShare > 0
            ? ((current.summary.totalBrokerShare - previous.summary.totalBrokerShare) / previous.summary.totalBrokerShare) * 100
            : 0
    };

    return {
        current,
        previous,
        change
    };
}
