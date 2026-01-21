// Utility function for sending emails using Nodemailer
const nodemailer = require('nodemailer');

// Create reusable transporter object (connection pool)
let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        // Check if using Gmail
        const isGmail = process.env.MAIL_HOST?.includes('gmail') || 
                        process.env.MAIL_USER?.includes('gmail');
        
        if (isGmail) {
            // Gmail specific configuration
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                }
            });
        } else {
            // Generic SMTP configuration
            transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: parseInt(process.env.MAIL_PORT) || 587,
                secure: process.env.MAIL_PORT === '465',
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        }
        
        console.log('Mail transporter created for:', process.env.MAIL_USER);
    }
    return transporter;
};

const mailSender = async (email, title, body) => {
    try {
        console.log('Sending email to:', email, 'Subject:', title);
        
        const transport = getTransporter();

        const info = await transport.sendMail({
            from: `"LearningEdge" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body
        });

        console.log('Email sent successfully. Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error while sending mail:', error);
        throw error;
    }
}

module.exports = mailSender;