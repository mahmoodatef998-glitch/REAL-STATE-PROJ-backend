import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { CONFIG } from './index';

// Configure Cloudinary
cloudinary.config({
    cloud_name: CONFIG.CLOUDINARY_CLOUD_NAME,
    api_key: CONFIG.CLOUDINARY_API_KEY,
    api_secret: CONFIG.CLOUDINARY_API_SECRET
});

// Setup Multer Storage for Cloudinary
export const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine folder based on route (optional)
        const folder = 'al-rabei-properties';

        return {
            folder: folder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
            public_id: `${Date.now()}-${file.originalname.split('.')[0].replace(/\s+/g, '_')}`,
            transformation: [{ width: 1200, height: 800, crop: 'limit' }]
        };
    },
});

export { cloudinary };
