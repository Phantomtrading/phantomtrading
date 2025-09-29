const resetPasswordTemplate = (resetLink: string, firstName: string) => `
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
</head>
<body>
  <div class="container">
    <h1>Hello ${firstName},</h1>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Best regards,<br />The PBroker Team</p>
  </div>
</body>
</html>
`;

export default resetPasswordTemplate;
