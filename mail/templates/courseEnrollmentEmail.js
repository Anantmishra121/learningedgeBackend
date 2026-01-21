// Email template for course enrollment confirmation
exports.courseEnrollmentEmail = (courseName, name) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Welcome to LearningEdge - Course Enrollment Confirmation</title>
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
    
            .cta {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FFD60A;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href=""><img class="logo" src="https://image2url.com/images/1756441995877-03772813-266a-4878-ae6d-2e65b0224a11.jpg"
                    alt="LearningEdge Logo"></a>
            <div class="message">Course Enrollment Confirmation</div>
            <div class="body">
                <p>Dear ${name},</p>
                <p>Congratulations! You have successfully enrolled in the course <span class="highlight">"${courseName}"</span> on LearningEdge. We are thrilled to welcome you to our learning community!</p>
                <p>To begin your educational journey, please access your personalized dashboard where you can explore course materials, track your progress, and engage with interactive content.
                </p>
            </div>
            <div class="support">If you have any questions or need assistance, please feel free to reach out to us at 
            <a href="mailto:noreply.learnedge@gmail.com">noreply.learnedge@gmail.com</a>. We are here to help!</div>
        </div>
    </body>
    
    </html>`;
  };