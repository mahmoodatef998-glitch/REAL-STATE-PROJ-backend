import { prisma } from '../database';

export class Usage {
    id: number;
    companyId: number;
    resourceType: string;
    count: number;
    month: number;
    year: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.companyId = data.companyId || data.company_id;
        this.resourceType = data.resourceType || data.resource_type;
        this.count = data.count || 0;
        this.month = data.month;
        this.year = data.year;
        this.createdAt = data.createdAt || data.created_at;
        this.updatedAt = data.updatedAt || data.updated_at;
    }

    /**
     * Get current usage for a resource type
     */
    static async getCurrentUsage(companyId: number, resourceType: string, month: number, year: number): Promise<number> {
        try {
            const usage = await prisma.usage.findUnique({
                where: {
                    companyId_resourceType_month_year: {
                        companyId: Number(companyId),
                        resourceType,
                        month,
                        year
                    }
                }
            });

            return usage ? usage.count : 0;
        } catch (error) {
            console.error('Error getting current usage:', error);
            return 0;
        }
    }

    /**
     * Increment usage count
     */
    static async increment(companyId: number, resourceType: string, month: number, year: number): Promise<Usage> {
        try {
            const usage = await prisma.usage.upsert({
                where: {
                    companyId_resourceType_month_year: {
                        companyId: Number(companyId),
                        resourceType,
                        month,
                        year
                    }
                },
                update: {
                    count: { increment: 1 }
                },
                create: {
                    companyId: Number(companyId),
                    resourceType,
                    count: 1,
                    month,
                    year
                }
            });

            return new Usage(usage);
        } catch (error) {
            console.error('Error incrementing usage:', error);
            throw error;
        }
    }

    /**
     * Decrement usage count
     */
    static async decrement(companyId: number, resourceType: string, month: number, year: number): Promise<Usage | null> {
        try {
            const usage = await prisma.usage.findUnique({
                where: {
                    companyId_resourceType_month_year: {
                        companyId: Number(companyId),
                        resourceType,
                        month,
                        year
                    }
                }
            });

            if (usage && usage.count > 0) {
                const updated = await prisma.usage.update({
                    where: { id: usage.id },
                    data: { count: { decrement: 1 } }
                });
                return new Usage(updated);
            }

            return null;
        } catch (error) {
            console.error('Error decrementing usage:', error);
            throw error;
        }
    }

    /**
     * Get usage history for a company
     */
    static async getHistory(companyId: number, months: number = 12): Promise<any[]> {
        try {
            const currentDate = new Date();
            const results = [];

            for (let i = 0; i < months; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();

                const usageRecords = await prisma.usage.findMany({
                    where: {
                        companyId: Number(companyId),
                        month,
                        year
                    }
                });

                const usage: any = {
                    month,
                    year,
                    property: 0,
                    broker: 0,
                    lead: 0,
                    deal: 0
                };

                usageRecords.forEach(record => {
                    if (usage[record.resourceType] !== undefined) {
                        usage[record.resourceType] = record.count;
                    }
                });

                results.push(usage);
            }

            return results.reverse(); // Oldest first
        } catch (error) {
            console.error('Error getting usage history:', error);
            return [];
        }
    }
}
