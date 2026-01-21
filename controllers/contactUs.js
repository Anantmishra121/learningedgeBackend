// Controller for handling contact form submissions
const mailSender = require('../utils/mailSender');

// ================ CONTACT US FORM HANDLER ================
exports.contactUs = async (req, res) => {
    try {
        // Extract data from request body
        const { firstName, lastName, email, phoneNo, message, countryCode } = req.body;

        // Validate required fields
        if (!firstName || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'First name, email and message are required fields'
            });
        }

        // Prepare email content for admin notification
        const adminEmailBody = `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${firstName} ${lastName || ''}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phoneNo ? `<p><strong>Phone:</strong> ${countryCode || ''} ${phoneNo}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        // Send email to admin (you can configure admin email in .env)
        const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
        await mailSender(
            adminEmail,
            `New Contact Form Submission from ${firstName}`,
            adminEmailBody
        );

        // Prepare confirmation email for user
        const userEmailBody = `
            <h2>Thank you for contacting LearningEdge!</h2>
            <p>Dear ${firstName},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p><strong>Your message:</strong></p>
            <p>${message}</p>
            <br>
            <p>Best regards,</p>
            <p>LearningEdge Team</p>
        `;

        // Send confirmation email to user
        await mailSender(
            email,
            'We received your message - LearningEdge',
            userEmailBody
        );

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Thank you for contacting us. We will get back to you soon!'
        });

    } catch (error) {
        console.log('Error while processing contact form submission:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process your request. Please try again later.',
            error: error.message
        });
    }
};
