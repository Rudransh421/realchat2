/*
gamil : dummy26071999@gmail.com
*/


const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const { MongoClient } = require("mongodb");

// Function to generate OTP
function generateOTP() {
  return randomstring.generate({
    length: 6,
    charset: "numeric",
  });
}

// for generating verification token 

function generateVerificationToken() {
  return randomstring.generate({
    length: 32, // Adjust the length as needed
    charset: "alphanumeric",
  });
}


// Function to send OTP email
async function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: "dummy26071999@gmail.com", // Replace with your Gmail address
      pass: "gncpqmwxwdlepgkx", // Replace with your Gmail app password
    },
  });

  const mailOptions = {
    from: "dummy26071999@gmail.com", // Corrected email address
    to: email,
    subject: "OTP Verification",
    text: `Your OTP for verification is: ${otp}`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Function to connect to MongoDB
async function connectToDB() {
  const mongoURL = "mongodb://localhost:27017";
  const dbName = "realchat";
  const collectionName = "otps";

  try {
    const client = new MongoClient(mongoURL);
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName).collection(collectionName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

async function sendVerificationLink(email, link) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: "dummy26071999@gmail.com", 
      pass: "gncpqmwxwdlepgkx", 
    },
  });

  const mailOptions = {
    from: "dummy26071999@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Click the following link to verify your email: ${link}`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Verification link sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}


// Function to handle sending OTP and links for verification
async function verificationSent(req, res, user, type) {
  try {
    const timestamp = Date.now();
    const collection = await connectToDB();

    if (type === "signup") {
      const verificationToken = generateVerificationToken();
      const verificationLink = `${req.protocol}://${req.get('host')}/verifyemail?token=${verificationToken}&email=${user.email}`;
      
      await collection.insertOne({ email: user.email, verificationToken, timestamp });
      await sendVerificationLink(user.email, verificationLink);

      console.log("Verification link sent successfully");
      res.redirect("/verifylink"); // Directs to a page where user is informed to check their email
    } else if (type === "login") {
      const otp = generateOTP();
      await collection.insertOne({ email: user.email, otp, timestamp });
      await sendOTP(user.email, otp);

      console.log("OTP sent successfully");
      res.redirect("/verifyotp-in");
    } else {
      res.status(400).send("Unknown verification type.");
    }
  } catch (err) {
    console.error("Error sending verification:", err);
    res.status(500).send("Error processing request.");
  }
}

// Function to handle OTP verification
async function verification(req, res) {
  try {
    const { email, otp } = req.body;
    const collection = await connectToDB();
    const storedOTP = await collection.findOne({ email: email });

    if (!storedOTP) {
      return res.json({
        verified: false,
        message: "OTP not found or expired.",
      });
    }

    const isOtpValid =
      storedOTP.otp === otp &&
      Date.now() - storedOTP.timestamp <= 24 * 60 * 60 * 1000;

      return { isOtpValid };
  } catch (err) {
    console.error("Verification error:", err);
    return res.json({
      verified: false,
      message: "Verification failed.",
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const { email, token } = req.query;
    const collection = await connectToDB();
    const storedData = await collection.findOne({ email: email });

    if (!storedData || storedData.verificationToken !== token) {
      return res.json({
        verified: false,
        message: "Invalid or expired verification link.",
      });
    }

    // Email verified, now you can update the user's status in the database
    await collection.updateOne({ email: email }, { $set: { verified: true } });
    console.log({
      verified: true,
      message: "Email successfully verified.",
    });

    const isverified = await collection.findOne({ email: email });
    if( isverified.verified == true){
      await collection.deleteOne({email:email})
    }
    else{
      console.log('Unable to delete from database')
    }
    return res.render('home')
  } catch (err) {
    console.error("Verification error:", err);
    return res.json({
      verified: false,
      message: "Verification failed.",
    });
  }
}


module.exports = {
  connectToDB,
  verificationSent,
  verification,
  verifyEmail,
};
