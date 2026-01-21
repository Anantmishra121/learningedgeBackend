// Utility function for sending emails using Nodemailer
const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: '<' + process.env.MAIL_USER + '>',
            to: email,
            subject: title,
            html: body
        });

        return info;
    } catch (error) {
        throw new Error('Error while sending mail: ' + error.message);
    }
}

module.exports = mailSender;