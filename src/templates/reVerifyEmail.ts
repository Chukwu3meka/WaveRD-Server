export default ({ fullName, activationLink }: any) => `
    Hi ${fullName},
    <br />
    <br />
    We noticed that you have not yet verified your email. To continue using our platform, it is important that you confirm your email address.
    <br />
    <br />
    Please follow this <a href="${activationLink}">link</a>, which will become inactive after 3 hours, to verify your email and keep your account active. If clicking the link didn't work, kindly copy and paste the link ${activationLink} into your browser and then activate it with a
    click
    <br />
    <br />
    Don't Miss Out: We've granted you a 7-day extension from now to verify your email before deadline and keep your account active and avoid account deletion
    <br />
    <br />
    Thank you for using our service. If you have any questions or need assistance, please don't hesitate to reach out to us <a href="https://www.soccermass.com/info/contact">here</a>.
    <br />
    <br />
    Warm Regards,
    `;
