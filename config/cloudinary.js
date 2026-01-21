const cloudinary = require("cloudinary").v2;

// Function to connect to Cloudinary for image uploads
exports.cloudinaryConnect = () => {
	try {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
		console.log('Cloudinary connected successfully')
	} catch (error) {
		console.log(error);
	}
};


