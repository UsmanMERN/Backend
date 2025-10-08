import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = async (filePath: string) => {
    console.log('filePath :>> ', filePath);
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'backend',
        });
        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error("Cloudinary Upload Error: ", error);
        throw new Error("Failed to upload image to Cloudinary");
    }
};

export { uploadToCloudinary };