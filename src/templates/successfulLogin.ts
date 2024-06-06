export default ({ name }: any) => `
    Dear ${name},
    <br />
    <br />
    We'd like to inform you that a successful login was made to your Wave Research account on ${new Date().toDateString()} at ${
  new Date().toLocaleString().split(",")[1]
}.
    <br />
    <br />
    If this was not you, please take immediate action to secure your account by changing your password.
    <br />
    <br />    
    Thank you for using our service. If you have any questions or concerns, please don't hesitate to reach out to us <a href="https://www.waverd.com/info/contact-us">here</a>.
    <br />
    <br />
    Best regards
    `;
