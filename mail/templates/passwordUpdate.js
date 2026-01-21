// Email template for password update confirmation
exports.passwordUpdated = (email, name) => {
	return `<!DOCTYPE html>
<html>

<head>
	<meta charset="UTF-8">
	<title>Password Update Confirmation</title>
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
		<a href="">
			<img class="logo" src="https://image2url.com/images/1756441995877-03772813-266a-4878-ae6d-2e65b0224a11.jpg" alt="LearningEdge Logo">
		</a>
		<div class="message">Password Update Confirmation</div>
		<div class="body">
			<p>${name},</p>
			<p>
				Your password has been successfully updated for the account associated with
				<span class="highlight">${email}</span>.
			</p>
			<p>
				If you did not initiate this password change, please contact our support team immediately
				to secure your account and prevent unauthorized access.
			</p>
		</div>
		<div class="support">
			If you have any questions or need further assistance, please feel free to reach out to us at
			<a href="mailto:noreply.learnedge@gmail.com">noreply.learnedge@gmail.com</a>.
			We are here to help!
		</div>
	</div>
</body>

</html>`;
};