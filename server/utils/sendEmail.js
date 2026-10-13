const nodemailer  = require('nodemailer');
const MailSetting = require('../models/dependence/MailSetting');

const sendEmail = async (options) => {
    try {
        const config = await MailSetting.findOne({ status: true });
        if (!config) throw new Error('Mail configuration not found or is disabled.');

        const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER, // support@theorchardengine.co
    pass: process.env.EMAIL_PASS, // Orchard_engin@04
  },
});

        await transporter.sendMail({
            from:    `"Orchard Engine" <${config.mailFromAddress}>`,
            to:      options.email,
            subject: options.subject,
            text:    options.message,
            ...(options.html ? { html: options.html } : {}),
        });

        // console.log('✅ Email sent to:', options.email);
        return true;
    } catch (error) {
        // console.error('❌ Email Error:', error.message);
        return false;
    }
};

module.exports = sendEmail;