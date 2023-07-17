const nodemailer = require('nodemailer');

// Create a transporter with your Gmail account credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'themisto.sales@gmail.com', // Your Gmail email address
    pass: 'lwljokcbaunzaxqv' // Your Gmail password or app password
  }
});

function leadEmail(recipient, message) {
  return new Promise((resolve, reject) => {
    // Compose the email message
    const mailOptions = {
      from: 'themisto.sales@gmail.com', // Sender address (your Gmail email address)
      to: recipient, // Recipient address
      subject: 'Exciting News! From Team Themisto',
      text: message
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        console.log(`Email sent successfully to ${recipient}!`);
        console.log('Message ID:', info.messageId);
        resolve();
      }
    });
  });
}

module.exports = { leadEmail };
