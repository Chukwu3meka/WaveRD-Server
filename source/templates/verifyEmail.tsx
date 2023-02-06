export default ({ fullName, handle, activationLink }: any) => `<html>
<head>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" rel="stylesheet">
  <style>
    body {
      font-family: Arial, sans-serif;
    }
    
    .header {
      text-align: center;
      margin-bottom: 50px;
    }
    
    .header img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      margin: 0 auto;
    }
    
    .content {
      width: 50%;
      margin: 0 auto;
    }
    
    .social-icons {
      display: flex;
      justify-content: center;
      margin-top: 50px;
    }
    
    .social-icons a {
      font-size: 30px;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://www.soccermass.com/images/layout/soccermass.webp" alt="SoccerMASS Logo">
  </div>
  
  <div class="content">

  Dear ${fullName},
  <br/>
  Thank you @${handle}, for signing up with us! To complete your registration and start enjoying our services, kindly verify your email address by clicking the activation <a href="${activationLink}">link</a>. 
  <br/>  
  Kindly copy and paste the link '${activationLink}' into your browser and then activate it with a click
  <br/>  
  Please note that the activation link is only valid for 3 hours, so be sure to confirm your email as soon as possible. If you did not create an account with us, please disregard this message and your account will be automatically deleted after 7 days.
  <br/>
  We are excited to have you as a part of our community!
  <br/> 
  Best regards,
  <br/>
  SoccerMASS
  

  </div>
  
  <div class="social-icons">
    <a href="https://web.facebook.com/soccermass" class="fab fa-facebook-f"></a>
    <a href="https://twitter.com/SoccerMASSinc/" class="fab fa-twitter"></a>
    <a href="https://www.instagram.com/SoccerMASSinc/" class="fab fa-instagram"></a>
    <a href="https://www.linkedin.com/company/soccermass/" class="fab fa-linkedin-in"></a>
  </div>
</body>
</html>`;
