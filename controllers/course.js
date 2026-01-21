// Import required modules
const Course = require('../models/course');
const User = require('../models/user');
const Category = require('../models/category');
const Section = require('../models/section')
const SubSection = require('../models/subSection')
const CourseProgress = require('../models/courseProgress')

const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');
const { convertSecondsToDuration } = require("../utils/secToDuration")

// ================ CREATE NEW COURSE ================
exports.createCourse = async (req, res) => {
    try {
        // Extract data from request body
        let { courseName, courseDescription, whatYouWillLearn, price, category, instructions: _instructions, status, tag: _tag } = req.body;

        // Convert tag and instructions from stringified array to array
        let tag, instructions;
        try {
            tag = JSON.parse(_tag);
            instructions = JSON.parse(_instructions);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON format for tag or instructions'
            });
        }

        // Get thumbnail image from request
        const thumbnail = req.files?.thumbnailImage;

        // Validate required fields
        if (!courseName || !courseDescription || !whatYouWillLearn || !price
            || !category || !thumbnail || !instructions.length || !tag.length) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Set default status if not provided
        if (!status || status === undefined) {
            status = "Draft";
        }

        // Get instructor ID from authenticated user
        const instructorId = req.user.id;

        // Validate category
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(401).json({
                success: false,
                message: 'Category details not found'
            })
        }

        // Upload thumbnail to Cloudinary
        let thumbnailDetails;
        try {
            thumbnailDetails = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload thumbnail image',
                error: error.message
            });
        }

        if (!thumbnailDetails || !thumbnailDetails.secure_url) {
            return res.status(400).json({
                success: false,
                message: 'Failed to upload thumbnail image'
            });
        }

        // Create course entry in database
        let newCourse;
        try {
            newCourse = await Course.create({
                courseName, courseDescription, instructor: instructorId, whatYouWillLearn, price, category: categoryDetails._id,
                tag, status, instructions, thumbnail: thumbnailDetails.secure_url, createdAt: Date.now(),
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create course in database',
                error: error.message
            });
        }

        // Add course to instructor's courses list
        try {
            await User.findByIdAndUpdate(instructorId,
                {
                    $push: {
                        courses: newCourse._id
                    }
                },
                { new: true }
            );
        } catch (error) {
            // If this fails, we should delete the created course
            await Course.findByIdAndDelete(newCourse._id);
            return res.status(500).json({
                success: false,
                message: 'Failed to update instructor courses',
                error: error.message
            });
        }

        // Add course to category's courses list
        try {
            await Category.findByIdAndUpdate(
                { _id: category },
                {
                    $push: {
                        courses: newCourse._id,
                    },
                },
                { new: true }
            );
        } catch (error) {
            // If this fails, we should clean up
            await User.findByIdAndUpdate(instructorId, { $pull: { courses: newCourse._id } });
            await Course.findByIdAndDelete(newCourse._id);
            return res.status(500).json({
                success: false,
                message: 'Failed to update category courses',
                error: error.message
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            data: newCourse,
            message: 'New course created successfully'
        })
    }

    catch (error) {
        console.log('Error while creating new course');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating new course'
        })
    }
}


// ================ SHOW ALL COURSES ================
exports.getAllCourses = async (req, res) => {
    try {
        // Fetch all courses with selected fields
        const allCourses = await Course.find({},
            {
                courseName: true, courseDescription: true, price: true, thumbnail: true, instructor: true,
                ratingAndReviews: true, studentsEnrolled: true
            })
            .populate({
                path: 'instructor',
                select: 'firstName lastName email image'
            })
            .exec();

        // Return response
        return res.status(200).json({
            success: true,
            data: allCourses,
            message: 'Data for all courses fetched successfully'
        });
    }

    catch (error) {
        console.log('Error while fetching data of all courses');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching data of all courses'
        })
    }
}



// ================ GET COURSE DETAILS ================
exports.getCourseDetails = async (req, res) => {
    try {
        // Get course ID from request body
        const { courseId } = req.body;

        // Fetch course details with population
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    select: "-videoUrl",
                },
            })
            .exec()

        // Validate course existence
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        // Calculate total duration in seconds
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        // Return response
        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
            },
            message: 'Fetched course data successfully'
        })
    }

    catch (error) {
        console.log('Error while fetching course details');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching course details',
        });
    }
}


// ================ GET FULL COURSE DETAILS ================
exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id

        // Fetch course details with full population
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        // Fetch course progress for the user
        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        // Validate course existence
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // Calculate total duration
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        // Return response
        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos : [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}



// ================ EDIT COURSE DETAILS ================
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        // Validate course existence
        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // Update thumbnail if provided
        if (req.files) {
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update other fields
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }

        // Update timestamp
        course.updatedAt = Date.now();

        // Save changes
        await course.save()

        // Fetch updated course with population
        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        // Return success response
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Error while updating course",
            error: error.message,
        })
    }
}



// ================ GET COURSES FOR INSTRUCTOR ================
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get instructor ID from authenticated user
        const instructorId = req.user.id

        // Find all courses for the instructor
        const instructorCourses = await Course.find({ instructor: instructorId, }).sort({ createdAt: -1 })

        // Return response
        res.status(200).json({
            success: true,
            data: instructorCourses,
            message: 'Courses made by instructor fetched successfully'
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}



// ================ DELETE COURSE ================
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // Delete course thumbnail from Cloudinary
        await deleteResourceFromCloudinary(course?.thumbnail);

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    const subSection = await SubSection.findById(subSectionId)
                    if (subSection) {
                        await deleteResourceFromCloudinary(subSection.videoUrl) // Delete course videos from Cloudinary
                    }
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Error while deleting course",
            error: error.message,
        })
    }
}




