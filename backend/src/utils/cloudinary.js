import { cloudinary } from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'notes',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
    }
});

// Create multer upload instance
export const upload = multer({ storage: storage });

// Utility function to upload file to Cloudinary
export const uploadToCloudinary = async (filePath, options = {}) => {
    try {
        // Log Cloudinary configuration for debugging
        console.log('Cloudinary Config:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
            api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
            api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
        });
        
        console.log('Uploading file to Cloudinary:', {
            filePath,
            options: {
                folder: options.folder || 'notes',
                resource_type: options.resource_type || 'raw',
            }
        });

        // Simple upload with minimal options
        const result = await cloudinary.uploader.upload(filePath, {
            folder: options.folder || 'notes',
            resource_type: options.resource_type || 'raw'
        });

        console.log('Cloudinary upload successful:', {
            secure_url: result.secure_url,
            public_id: result.public_id
        });

        return result;
    } catch (error) {
        console.error('Detailed Cloudinary error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            details: error.error || 'No additional details'
        });
        
        throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
    }
}; 