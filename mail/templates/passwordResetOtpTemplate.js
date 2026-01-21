// Email template for OTP verification during password reset
const passwordResetOtpTemplate = (otp, name) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Password Reset OTP</title>
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
			<a href=""><img class="logo" src="https://image2url.com/images/1756441995877-03772813-266a-4878-ae6d-2e65b0224a11.jpg" alt="LearningEdge Logo"></a>
			<div class="message">Password Reset Request</div>
			<div class="body">
				<p>Dear ${name},</p>
				<p>We received a request to reset your password for your LearningEdge account.</p>
				<p>To proceed with the password reset, please use the following One-Time Password (OTP):</p>
				<h2 class="highlight">${otp}</h2>
				<p><strong>Important:</strong> This OTP will expire in 5 minutes for your security. Please enter it promptly to reset your password.</p>
				<p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
			</div>
			<div class="support">
				<p>Need assistance? Our support team is here to help.</p>
				<p>Contact us at <a href="mailto:noreply.learnedge@gmail.com">noreply.learnedge@gmail.com</a></p>
				<p>Best regards,<br>The LearningEdge Team</p>
			</div>
		</div>
	</body>
	
	</html>`;
};

module.exports = passwordResetOtpTemplate;
