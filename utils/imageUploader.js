// Utility functions for image upload and management with Cloudinary
const cloudinary = require('cloudinary').v2;

// Upload image to Cloudinary
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        const options = { folder };
        if (height) options.height = height;
        if (quality) options.quality = quality;
        options.resource_type = 'auto';
        return await cloudinary.uploader.upload(file.tempFilePath, options);
    } catch (error) {
        throw new Error('Error while uploading image: ' + error.message);
    }
}

// Delete resource from Cloudinary by public ID
exports.deleteResourceFromCloudinary = async (url) => {
    if (!url) return;

    try {
        const result = await cloudinary.uploader.destroy(url);
        return result;
    } catch (error) {
        throw new Error(`Error deleting resource with public ID ${url}: ${error.message}`);
    }
};