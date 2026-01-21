// Import required modules
const Razorpay = require('razorpay');
const { instance } = require('../config/razorpay');
const crypto = require('crypto');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
const { paymentSuccessEmail } = require('../mail/templates/paymentSuccessEmail');
require('dotenv').config();

const User = require('../models/user');
const Course = require('../models/course');
const CourseProgress = require("../models/courseProgress")
const Payment = require('../models/payment')

const { default: mongoose } = require('mongoose')

// ================ CAPTURE PAYMENT AND INITIATE RAZORPAY ORDER ================
exports.capturePayment = async (req, res) => {
    // Extract course IDs and user ID
    const { coursesId } = req.body;
    const userId = req.user.id;

    // Validate course IDs
    if (coursesId.length === 0) {
        return res.json({ success: false, message: "Please provide Course ID" });
    }

    let totalAmount = 0;

    // Calculate total amount and validate courses
    for (const course_id of coursesId) {
        let course;
        try {
            // Validate course details
            course = await Course.findById(course_id);
            if (!course) {
                return res.status(404).json({ success: false, message: "Could not find the course" });
            }

            // Check if user is already enrolled
            const uid = new mongoose.Types.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(400).json({ success: false, message: "Student is already enrolled" });
            }

            totalAmount += course.price;
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Create order options
    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    }

    // Initiate payment using Razorpay
    try {
        const paymentResponse = await instance.orders.create(options);
        // Return response
        res.status(200).json({
            success: true,
            message: paymentResponse,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Could not initiate order" });
    }
}

// ================ VERIFY PAYMENT ================
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.coursesId;
    const userId = req.user.id;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
        return res.status(400).json({ success: false, message: "Payment failed, data not found" });
    }

    // Create expected signature
    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    // Verify signature
    if (expectedSignature === razorpay_signature) {
        // Save payment record
        for (const courseId of courses) {
            const course = await Course.findById(courseId);
            await Payment.create({
                userId,
                courseId,
                transactionId: razorpay_payment_id,
                amount: course.price,
                status: 'Completed',
                paymentMethod: 'Razorpay',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id
            });
        }
        // Enroll students
        await enrollStudents(courses, userId, res);
        // Return success
        return res.status(200).json({ success: true, message: "Payment verified" });
    }
    return res.status(200).json({ success: "false", message: "Payment failed" });
}

// ================ ENROLL STUDENTS TO COURSE AFTER PAYMENT ================
const enrollStudents = async (courses, userId, res) => {
    // Validate inputs
    if (!courses || !userId) {
        return res.status(400).json({ success: false, message: "Please provide data for courses or user ID" });
    }

    // Enroll in each course
    for (const courseId of courses) {
        try {
            // Enroll student in course
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true },
            )

            if (!enrolledCourse) {
                return res.status(500).json({ success: false, message: "Course not found" });
            }

            // Initialize course progress
            const courseProgress = await CourseProgress.create({
                courseID: courseId,
                userId: userId,
                completedVideos: [],
            })

            // Add course to user's enrolled courses
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId,
                        courseProgress: courseProgress._id,
                    },
                },
                { new: true }
            )

            // Send enrollment email
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
            )
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

// ================ SEND PAYMENT SUCCESS EMAIL ================
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({ success: false, message: "Please provide all the fields" });
    }

    try {
        // Find enrolled student
        const enrolledStudent = await User.findById(userId);
        // Send success email
        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(`${enrolledStudent.firstName}`,
                amount / 100, orderId, paymentId)
        )
    }
    catch (error) {
        console.log("Error in sending mail", error)
        return res.status(500).json({ success: false, message: "Could not send email" })
    }
}