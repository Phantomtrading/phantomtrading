const emailVerificationTemplate = (otp:string, firstName:string) => `
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9fafb;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 480px;
      margin: 40px auto;
      background-color: #ffffff;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      padding: 30px 40px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 22px;
      margin-bottom: 16px;
      color: #111827;
    }
    p {
      font-size: 16px;
      margin-bottom: 24px;
      line-height: 1.4;
    }
    .otp-code {
      display: inline-block;
      padding: 12px 24px;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #111827;
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      user-select: all;
    }
    .footer {
      font-size: 13px;
      color: #6b7280;
      margin-top: 32px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello ${firstName},</h1>
    <p>Thank you for registering at PBroker. Please use the verification code below to verify your email address:</p>
    <p class="otp-code">${otp}</p>
    <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
    <p>Best regards,<br />The PBroker Team</p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} PBroker. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

export default emailVerificationTemplate;