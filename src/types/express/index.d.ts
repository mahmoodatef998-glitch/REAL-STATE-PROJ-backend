import { User } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: User;
            isSuperAdmin?: boolean;
            tenantId?: number;
            resourceType?: string;
        }
    }
}
