const nodemailer = require('nodemailer');

// Create a transporter with your Gmail account credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'themisto.sales@gmail.com', // Your Gmail email address
        pass: 'lwljokcbaunzaxqv' // Your Gmail password or app password
    }
});

function sendEmail(name, email) {
    return new Promise((resolve, reject) => {
        // Compose the email message
        const mailOptions = {
            from: 'themisto.sales@gmail.com', // Sender address (your Gmail email address)
            to: email, // Recipient address
            subject: 'Hello from TEAM THEMISTO',
            text: `Hi ${name},\n\nThanks for using Themisto bot! \nThe meeting is successfully fixed. Have a productive session!".\n\nRegards,\nYour Name`
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                console.log('Email sent successfully!');
                console.log('Message ID:', info.messageId);
                resolve();
            }
        });
    });
}

module.exports = { sendEmail };
