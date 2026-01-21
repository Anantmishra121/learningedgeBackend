// Import required modules
const Course = require('../models/course');
const Section = require('../models/section');

// ================ CREATE SECTION ================
exports.createSection = async (req, res) => {
    try {
        // Extract data from request body
        const { sectionName, courseId } = req.body;

        // Validate required fields
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        // Create section in database
        const newSection = await Section.create({ sectionName });

        // Add section to course
        const updatedCourse = await Course.findByIdAndUpdate(courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            },
            { new: true }
        );

        // Fetch updated course with populated sections
        const updatedCourseDetails = await Course.findById(courseId)
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection'
                }

            })

        // Return response
        res.status(200).json({
            success: true,
            updatedCourseDetails,
            message: 'Section created successfully'
        })
    }

    catch (error) {
        console.log('Error while creating section');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating section'
        })
    }
}

// ================ UPDATE SECTION ================
exports.updateSection = async (req, res) => {
    try {
        // Extract data from request body
        const { sectionName, sectionId, courseId } = req.body;

        // Validate required fields
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Update section name
        await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });

        // Fetch updated course
        const updatedCourseDetails = await Course.findById(courseId)
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection'
                }
            })

        // Return response
        res.status(200).json({
            success: true,
            data: updatedCourseDetails,
            message: 'Section updated successfully'
        });
    }
    catch (error) {
        console.log('Error while updating section');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while updating section'
        })
    }
}

// ================ DELETE SECTION ================
exports.deleteSection = async (req, res) => {
    try {
        const { sectionId, courseId } = req.body;

        // Delete section from database
        await Section.findByIdAndDelete(sectionId);

        // Fetch updated course
        const updatedCourseDetails = await Course.findById(courseId)
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection'
                }
            })

        // Return response
        res.status(200).json({
            success: true,
            data: updatedCourseDetails,
            message: 'Section deleted successfully'
        })
    }
    catch (error) {
        console.log('Error while deleting section');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while deleting section'
        })
    }
}

