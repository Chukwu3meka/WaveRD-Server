export default ({ fullName, activationLink }: any) => `
    Hi ${fullName},
    <br />
    <br />  
    We have received a request to reset the password for your account. If you did not request this, please ignore this email.
    <br />
    <br />
    To proceed with the password reset, please click the following <a href="${activationLink}">link</a>, which will become inactive after 3 hours. 
    <br />
    <br />
    If clicking the link didn't work, kindly copy and paste the link ${activationLink} into your browser. Please note that this link is only valid for 24 hours.
    <br />
    <br />
    If you have any questions or need assistance, please don't hesitate to reach out to us <a href="https://www.soccermass.com/info/contact">here</a>.
    <br />
    <br />
    Best Regards,
    `;
