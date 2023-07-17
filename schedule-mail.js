const nodemailer = require('nodemailer');

// Create a transporter with your Gmail account credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'themisto.sales@gmail.com', // Your Gmail email address
        pass: 'lwljokcbaunzaxqv' // Your Gmail password or app password
    }
});

function sendEmail(name, email, date) {
    return new Promise((resolve, reject) => {
        // Compose the email message
        const mailOptions = {
            from: 'themisto.sales@gmail.com', // Sender address (your Gmail email address)
            to: email, // Recipient address
            subject: 'Hello from TEAM THEMISTO',
            text: `Hi ${name}! , I hope this email finds you well. I am delighted to inform you that the sales meeting you requested has been successfully scheduled on ${date} . have a productive session`
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
