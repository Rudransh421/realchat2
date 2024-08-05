const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const { MongoClient } = require("mongodb");

function generateOTP() {
  return randomstring.generate({
    length: 6,
    charset: "numeric",
  });
}

async function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "cordia.schulist26@ethereal.email",
      pass: "KsbAvrfykYKeTMAgKG",
    },
  });

  const mailOptions = {
    from: "your_email@gmail.com",
    to: email,
    subject: "OTP Verification",
    text: `Your OTP for verification is: ${otp}`,
  };

  let info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

async function connectToDB() {
  const mongoURL = "mongodb://localhost:27017";
  const dbName = "realchat";
  const collectionName = "otps";

  try {
    const client = new MongoClient(mongoURL);
    await client.connect();
    console.log("verification can be used ");
    return client.db(dbName).collection(collectionName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

async function verificationSent(req, res, user, type) {
  try {
    const otp = generateOTP();
    const timestamp = Date.now();
    const collection = await connectToDB();

    await collection.insertOne({ email: user.email, otp, timestamp });
    await sendOTP(user.email, otp);

    switch (type) {
      case "signup":
        console.log({ message: "OTP sent successfully" });
        res.redirect("/verifyotp-up");
        break;
      case "login":
        console.log({ message: "OTP sent successfully" });
        res.redirect("/verifyotp-in");
        break;
      default:
        res.status(400).send("Unknown verification type.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing request.");
  }
}

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

    console.log(storedOTP.otp, otp)
    let isOtpValid =
      storedOTP.otp == otp &&
      Date.now() - storedOTP.timestamp <= 24 * 60 * 60 * 1000;

      
    return { isOtpValid };
  } catch (err) {
    return res.json({
      verified: false,
      message: "verification failed.",
    });
  }
}

module.exports = {
  connectToDB,
  verificationSent,
  verification,
};
