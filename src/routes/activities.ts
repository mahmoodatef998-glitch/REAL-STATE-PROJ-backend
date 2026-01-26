import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../database';
import { Lead } from '../models/Lead';
import { Property } from '../models/Property';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Track user action
router.post('/track', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guestId, propertyId, actionType } = req.body;
        const userId = (req as any).user?.id || null;

        if (!guestId || !propertyId || !actionType) {
            return res.status(400).json({ error: 'Missing required tracking data' });
        }

        // 1. Record the activity
        await (prisma as any).userActivity.create({
            data: {
                guestId: String(guestId),
                propertyId: Number(propertyId),
                actionType,
                userId: userId ? Number(userId) : null
            }
        });

        // 2. Logic: If action is 'view_all_images', check for frequency
        if (actionType === 'view_all_images') {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            // Count how many times this guest viewed all images of this property in the last 3 days
            const viewCount = await (prisma as any).userActivity.count({
                where: {
                    guestId: String(guestId),
                    propertyId: Number(propertyId),
                    actionType: 'view_all_images',
                    createdAt: {
                        gte: threeDaysAgo
                    }
                }
            });

            // 3. If count >= 2, create a behavioral lead if one doesn't exist
            if (viewCount >= 2) {
                // Check if a lead for this guest and property already exists
                const existingLead = await (prisma.lead as any).findFirst({
                    where: {
                        guestId: String(guestId),
                        propertyId: Number(propertyId)
                    }
                });

                if (!existingLead) {
                    const property = await Property.findById(propertyId);
                    if (property && property.owner) {
                        await Lead.create({
                            name: `Interested Guest (${guestId.substring(0, 8)})`,
                            message: `System Alert: High interest detected. This guest has viewed all property images ${viewCount} times in the last 3 days.`,
                            propertyId: Number(propertyId),
                            brokerId: (property.owner as any).id,
                            companyId: (property.owner as any).companyId || null,
                            guestId: String(guestId),
                            isBehavioral: true,
                            status: 'new'
                        });
                    }
                } else if ((existingLead as any).isBehavioral) {
                    // Update existing behavioral lead message with latest count
                    await prisma.lead.update({
                        where: { id: (existingLead as any).id },
                        data: {
                            message: `System Alert: High interest detected. This guest has viewed all property images ${viewCount} times in the last 3 days.`,
                            updatedAt: new Date()
                        }
                    });
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ error: 'Internal tracking error' });
    }
});

export default router;
