const nodemailer = require("nodemailer");

module.exports.pushMail = async ({ emailBody, emailAddress, emailSubject }) => {
  const mailTransporter = nodemailer.createTransport({
    service: "zoho",
    auth: {
      user: process.env.EMAIL_ADDR,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailDetails = {
    from: process.env.EMAIL_ADDR,
    to: emailAddress,
    subject: emailSubject,
    html: `
    <!DOCTYPE html>

    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SoccerMASS: Football Manager</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            color: rgb(238, 234, 229);
            text-align: center;
            background: linear-gradient(
                170deg,
                rgba(49, 57, 73, 0.8) 20%,
                rgba(49, 57, 73, 0.5) 20%,
                rgba(49, 57, 73, 0.5) 35%,
                rgba(41, 48, 61, 0.6) 35%,
                rgba(41, 48, 61, 0.8) 45%,
                rgba(31, 36, 46, 0.5) 45%,
                rgba(31, 36, 46, 0.8) 75%,
                rgba(49, 57, 73, 0.5) 75%
              ),
              linear-gradient(
                  45deg,
                  rgba(20, 24, 31, 0.8) 0%,
                  rgba(41, 48, 61, 0.8) 50%,
                  rgba(82, 95, 122, 0.8) 50%,
                  rgba(133, 146, 173, 0.8) 100%
                )
                #313949;
            font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
          }
          h1 {
            color: rgb(68, 139, 68);
          }
          body > img {
            border-radius: 50%;
            height: 280px;
            width: 300px;
          }
          body > div {
            color: rgb(18, 20, 18);
            display: flex;
            flex-direction: row;
            justify-content: center;
            background-color: rgb(97, 97, 116);
            margin: 20px auto;
          }
          body > div > article {
            max-width: 200px;
          }
          article {
            font-size: 1.2em;
            padding: 5px;
          }
          a {
            color: rgb(255, 153, 0);
          }
          a:hover {
            color: rgb(68, 139, 68);
          }
    
          .glow-on-hover {
            width: 120px;
            height: 30px;
            border: none;
            outline: none;
            color: #fff;
            /* background: #111; */
            background-color: rgb(97, 97, 116);
            cursor: pointer;
            position: relative;
            z-index: 0;
            border-radius: 3px;
          }
    
          .glow-on-hover:before {
            content: "";
            background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
            position: absolute;
            top: -2px;
            left: -2px;
            background-size: 400%;
            z-index: -1;
            filter: blur(5px);
            width: calc(100% + 4px);
            height: calc(100% + 4px);
            animation: glowing 20s linear infinite;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            border-radius: 10px;
          }
    
          .glow-on-hover:active {
            color: #000;
          }
    
          .glow-on-hover:active:after {
            background: transparent;
          }
    
          .glow-on-hover:hover:before {
            opacity: 1;
          }
    
          .glow-on-hover:after {
            z-index: -1;
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgb(255, 153, 0);
    
            /* background: #111; */
            left: 0;
            top: 0;
            border-radius: 10px;
          }
    
          @keyframes glowing {
            0% {
              background-position: 0 0;
            }
            50% {
              background-position: 400% 0;
            }
            100% {
              background-position: 0 0;
            }
          }
    
          body > div > img {
            display: none;
            /* height: 180px; */
            max-width: 200px;
          }
          footer {
            padding: 10px;
          }
    
          @media screen and (min-width: 420px) {
            article {
              padding-right: 15px;
            }
            body > div > img {
              display: inline-block;
            }
          }
        </style>
      </head>
      <body>
        <h1>SoccerMASS</h1>
        <h3>No. 1 Free online Soccer Manager</h3>
        <img src="${process.env.CLIENT}images/soccermass.webp" alt="SoccerMASS Logo" />

        <main>${emailBody}</main>

        <div>
          <article>
            <h3>Create your legacy</h3>
            <h6>The best clubs and players are here, waiting for you</h6>
            <button class="glow-on-hover" type="button">SignUp</button>
          </article>
          <img src="${process.env.CLIENT}images/layout/indexSignin.png" alt="Signup Logo" />
        </div>
    
        <footer>
          <p>You are receiving this email because you have visited our site or asked us about regular newsletter.</p>
    
          <a target="_blank" href="">
            <img src="${process.env.CLIENT}images/social/facebook.png" alt="SoccerMASS Facebook Page" width="32" />
          </a>
          <a target="_blank" href="">
            <img src="${process.env.CLIENT}images/social/twitter.png" alt="SoccerMASS Twitter Page" width="32" />
          </a>
          <a target="_blank" href="">
            <img src="${process.env.CLIENT}images/social/pinterest.png" alt="SoccerMASS Pinterest Page" width="32" />
          </a>
          <a target="_blank" href="">
            <img src="${process.env.CLIENT}images/social/Instagram.png" alt="SoccerMASS Instagram Page" width="32" />
          </a>
          <a target="_blank" href="">
            <img src="${process.env.CLIENT}images/social/youtube.png" alt="SoccerMASS Youtube Page" width="32" />
          </a>
    
          <hr />
          <a target="_blank" href="tel:+2347064417213" style="text-decoration: none">+234 706 441 7213</a><br />
          <a target="_blank" href="mailto:contactus@viewcrunch.com" style="text-decoration: none">contactus@viewcrunch.com</a>

          <p>● ©SoccerMASS 2018 ~ ${new Date().getFullYear()} ●</p>
        </footer>
      </body>
    </html>
`,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (process.env.NODE_ENV !== "production") {
      if (err) {
        console.log("error sending mail", err);
      }
    }
  });
};
