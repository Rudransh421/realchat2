const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const { MongoClient } = require('mongodb');

function generateOTP() {
  return randomstring.generate({
    length: 6,
    charset: 'numeric'
  });
}

async function sendOTP(email, otp) {

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'zoila86@ethereal.email',
        pass: 'QkFVGaZmfKSgfu5s8R'
    }
});

 
  const mailOptions = {
    from: 'your_email@gmail.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP for verification is: ${otp}`
  };

  let info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

async function connectToDB() {
  const mongoURL = 'mongodb://localhost:27017';
  const dbName = 'realchat';
  const collectionName = 'otps';

  try {
    const client = new MongoClient(mongoURL);
    await client.connect();
    console.log('verification can be used ');
    return client.db(dbName).collection(collectionName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

module.exports ={
  generateOTP,
  sendOTP,
  connectToDB,
}


// Name	Nelson Kautzer
// Username	nelson.kautzer31@ethereal.email – this account can not be used for inbound emails 
// Password	rUBz6TxmpMqGd7KnQH
