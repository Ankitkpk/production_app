import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const uploadImageOnCloudinary = async (localfilePath) => {
    try {
        if (!localfilePath) return false;

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded to Cloudinary:", response.url);
        fs.unlinkSync(localfilePath);
        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);

        // Remove locally saved temporary file
        try {
            await fs.unlink(localfilePath);
            console.log("Local file deleted due to upload failure.");
        } catch (unlinkError) {
            console.error("Failed to delete local file:", unlinkError.message);
        }

        return { success: false, error: error.message };
    }
};

export default uploadImageOnCloudinary;
