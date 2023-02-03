export default () => `<html>
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
    <img src="https://via.placeholder.com/150x150" alt="Company Logo">
  </div>
  
  <div class="content">
    <!-- Add email content here -->
  </div>
  
  <div class="social-icons">
    <a href="#" class="fab fa-facebook-f"></a>
    <a href="#" class="fab fa-twitter"></a>
    <a href="#" class="fab fa-instagram"></a>
    <a href="#" class="fab fa-linkedin-in"></a>
  </div>
</body>
</html>`;
