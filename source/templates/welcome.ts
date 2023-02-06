export default ({ fullName, activationLink }: any) => `
    Dear ${fullName},
    <br />
    <br />
    Thank you for signing up with us! To complete your registration and start enjoying our services, kindly verify your email address by clicking
    the activation <a href="${activationLink}">link</a>. If clicking the link didn't work, kindly copy and paste the link ${activationLink} into your browser and then activate it with a
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
    Best regards
`;
