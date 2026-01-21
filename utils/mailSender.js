// Utility function for sending emails using Nodemailer
const nodemailer = require('nodemailer');

// Create reusable transporter object (connection pool)
let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            pool: true, // Use connection pooling
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 5
        });
    }
    return transporter;
};

const mailSender = async (email, title, body) => {
    try {
        const transport = getTransporter();

        const info = await transport.sendMail({
            from: '<' + process.env.MAIL_USER + '>',
            to: email,
            subject: title,
            html: body
        });

        return info;
    } catch (error) {
        console.error('Error while sending mail:', error.message);
        throw new Error('Error while sending mail: ' + error.message);
    }
}

module.exports = mailSender;