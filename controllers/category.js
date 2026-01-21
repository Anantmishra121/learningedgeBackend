const Category = require('../models/category')

// Utility function to get a random integer
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// ================ CREATE CATEGORY ================
exports.createCategory = async (req, res) => {
    try {
        // Extract data from request body
        const { name, description } = req.body;

        // Validate required fields
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create category in database
        const categoryDetails = await Category.create({
            name: name, description: description
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Category created successfully'
        });
    }
    catch (error) {
        console.log('Error while creating category');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error while creating category',
            error: error.message
        })
    }
}

// ================ DELETE CATEGORY ================
exports.deleteCategory = async (req, res) => {
    try {
        // Extract data from request body
        const { categoryId } = req.body;

        // Validate required fields
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        // Delete category from database
        await Category.findByIdAndDelete(categoryId);

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        console.log('Error while deleting category');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error while deleting category',
            error: error.message
        })
    }
}

// ================ GET ALL CATEGORIES ================
exports.showAllCategories = async (req, res) => {
    try {
        // Fetch all categories from database
        const allCategories = await Category.find({}, { name: true, description: true });

        // Return response
        res.status(200).json({
            success: true,
            data: allCategories,
            message: 'All categories fetched successfully'
        })
    }
    catch (error) {
        console.log('Error while fetching all categories');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error while fetching all categories'
        })
    }
}

// ================ GET CATEGORY PAGE DETAILS ================
exports.getCategoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body

        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            })
            .exec()

        // Handle case when category is not found
        if (!selectedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" })
        }

        // Handle case when no courses are found
        if (selectedCategory.courses.length === 0) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "No courses found for the selected category.",
            })
        }

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })

        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
                ._id
        )
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec()

        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                },
            })
            .exec()

        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        // Return response
        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}