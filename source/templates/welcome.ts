export default ({ fullName, handle, activationLink }: any) => `    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" rel="stylesheet" />
  <style>
    body {
      font-size: 16px;
      font-family: Arial, sans-serif;
      padding: 20px 10px;
      margin: auto;
    }

    .header {
      text-align: center;
      margin-bottom: 50px;
    }

    .header img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: auto;
    }

    .content {
      width: 100%;
      max-width: 300px;
      margin: auto;
    }

    a {
      color: rgb(68, 139, 68);
      text-decoration: none;
      transition: color 500ms ease-in;
    }

    a:hover {
      color: rgb(141, 202, 141);
      transition: color 300ms ease-out;
    }

    .social-icons {
      display: flex;
      justify-content: center;
      margin-top: 50px;
    }

    .social-icons a {
      font-size: 20px;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://www.soccermass.com/images/layout/soccermass.webp" alt="SoccerMASS Logo" />
  </div>

  <div class="content">
    Dear ${fullName},
    <br />
    <br />
    Thank you @${handle}, for signing up with us! To complete your registration and start enjoying our services, kindly verify your email address by clicking
    the activation <a href="${activationLink}">link</a>. If clicking the link didn't work, kindly copy and paste the link '${activationLink}' into your browser and then activate it with a
    click
    <br />
    <br />
    Please note that the activation link is only valid for 3 hours, so be sure to confirm your email as soon as possible. If you did not create an account
    with us, please disregard this message and your account will be automatically deleted after 7 days.
    <br />
    <br />
    We are excited to have you as a part of our community!
    <br />
    <br />
    Best regards,
    <br />
    <br />
    <a href="www.soccermass.com">SoccerMASS</a>
  </div>

  <div class="social-icons">
    <a href="https://web.facebook.com/soccermass" class="fab fa-facebook-f"></a>
    <a href="https://twitter.com/SoccerMASSinc/" class="fab fa-twitter"></a>
    <a href="https://www.instagram.com/SoccerMASSinc/" class="fab fa-instagram"></a>
    <a href="https://www.linkedin.com/company/soccermass/" class="fab fa-linkedin-in"></a>
  </div>
</body>
</html>
`;
