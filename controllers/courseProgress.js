// Import required modules
const mongoose = require("mongoose")
const Section = require("../models/section")
const SubSection = require("../models/subSection")
const CourseProgress = require("../models/courseProgress")

// ================ UPDATE COURSE PROGRESS ================
exports.updateCourseProgress = async (req, res) => {
    const { courseId, subsectionId } = req.body
    const userId = req.user.id

    try {
        // Validate subsection existence
        const subsection = await SubSection.findById(subsectionId)
        if (!subsection) {
            return res.status(404).json({ error: "Invalid subsection" })
        }

        // Find or create course progress document
        let courseProgress = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course progress does not exist",
            })
        } else {
            // Check if subsection is already completed
            if (courseProgress.completedVideos.includes(subsectionId)) {
                return res.status(400).json({ error: "Subsection already completed" })
            }

            // Add subsection to completed videos
            courseProgress.completedVideos.push(subsectionId)
        }

        // Save updated progress
        await courseProgress.save()

        // Return success response
        return res.status(200).json({ message: "Course progress updated" })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Internal server error" })
    }
}
