import cloudinary from '../config/cloudinary';
import fs from 'fs';

export const uploadToCloudinary = async (
    filePath: string,
    folder: string = 'surprise-gifting'
): Promise<{ url: string; publicId: string }> => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'auto',
        });

        // Delete local file after upload
        fs.unlinkSync(filePath);

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        // Delete local file if upload fails
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        // Don't throw error, just log it
    }
};
