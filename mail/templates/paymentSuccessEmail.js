// Email template for payment success confirmation
exports.paymentSuccessEmail = (name, amount, orderId, paymentId) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Payment Confirmation</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .highlight {
                font-weight: bold;
                color: #007cba;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <a href=""><img class="logo" src="https://image2url.com/images/1756441995877-03772813-266a-4878-ae6d-2e65b0224a11.jpg" alt="LearningEdge Logo"></a>
            <div class="message">Payment Confirmation</div>
            <div class="body">
                <p>Dear ${name},</p>
                <p>We are pleased to confirm that your payment has been successfully processed.</p>
                <p>Thank you for your business and for choosing LearningEdge as your learning partner.</p>
                
                <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 24px; margin: 24px 0; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="margin-top: 0; color: #2c3e50; font-size: 18px; font-weight: 600; border-bottom: 2px solid #007cba; padding-bottom: 8px;">Transaction Details</h3>
                    <div style="display: table; width: 100%; margin-top: 16px;">
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 8px 0; font-weight: 600; color: #495057; width: 40%;">Amount Paid:</div>
                            <div style="display: table-cell; padding: 8px 0; font-weight: 700; color: #007cba; font-size: 18px;">₹${amount}</div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 8px 0; font-weight: 600; color: #495057;">Payment ID:</div>
                            <div style="display: table-cell; padding: 8px 0; font-family: monospace; color: #6c757d;">${paymentId}</div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 8px 0; font-weight: 600; color: #495057;">Order ID:</div>
                            <div style="display: table-cell; padding: 8px 0; font-family: monospace; color: #6c757d;">${orderId}</div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 8px 0; font-weight: 600; color: #495057;">Transaction Status:</div>
                            <div style="display: table-cell; padding: 8px 0; color: #28a745; font-weight: 700;">Completed</div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 8px 0; font-weight: 600; color: #495057;">Date & Time:</div>
                            <div style="display: table-cell; padding: 8px 0; color: #6c757d;">${new Date().toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <p>Your course enrollment has been activated and you now have full access to the learning materials. You can begin your educational journey immediately through your student dashboard.</p>
                <p>Should you require any assistance with your courses or have questions regarding this transaction, please do not hesitate to contact our support team.</p>
            </div>
            <div class="support">
                <p>For support and inquiries, please contact us at <a href="mailto:noreply.learnedge@gmail.com" style="color: #007cba; text-decoration: none;">noreply.learnedge@gmail.com</a></p>
                <p style="margin-top: 16px; font-style: italic; color: #6c757d;">This is an automated confirmation email. Please do not reply to this message.</p>
                <p style="margin-top: 20px; font-weight: 600;">Best regards,<br>The LearningEdge Team</p>
            </div>
        </div>
    </body>
    
    </html>`;
};
