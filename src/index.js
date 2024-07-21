const express = require("express");
const router = express.Router();
const passport = require("../controler/passport");
const { generateOTP, sendOTP, connectToDB } = require("../controler/verify");
const User = require("../controler/signadb");
const bcrypt = require("bcryptjs");


router.get('/',(req,res)=>{
  res.render('wellcome') 
})

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/login", (req, res) => {
  res.render("login");
});


router.post('/login', (req, res, next) => {

  console.log(req.body.email); // Log email
  console.log(req.body.password); // Log password

  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log('!user');
      console.log(info.message);
      return res.redirect('/login');
    }
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      
      try {
        const otp = generateOTP();
        const timestamp = Date.now();
        const collection = await connectToDB();

        await collection.insertOne({ email: user.email, otp, timestamp });
        await sendOTP(user.email, otp);

        console.log({ message: 'OTP sent successfully' });
        res.redirect('/verifyotp');
      } catch (err) {
        console.error(err);
        res.send('Error processing request.');
      }
      
    });
  })(req, res, next);
});

router.get('/verifyotp', async(req,res)=>{
  res.render('verifyotp');
})

router.post("/verifyotp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const collection = await connectToDB();
    const storedOTP = await collection.findOne({ email });

    if (!storedOTP) {
      return res.json({
        verified: false,
        message: "OTP not found or expired.",
      });
    }

    const isOtpValid =
      storedOTP.otp === otp &&
      Date.now() - storedOTP.timestamp <= 24 * 60 * 60 * 1000;
    if (isOtpValid) {
      await collection.deleteOne({ email });
      res.render("home");
    } else {
      res.json({ verified: false, message: "Invalid OTP or expired." });
    }
  } catch (err) {
    console.error(err);
    res.json({ verified: false, message: "Error verifying OTP." });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phoneno, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      name,
      email,
      phoneno,
      password: hashedPassword,
    });

    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.send("Error creating user.");
  }
});

router.get("*", (req, res) => {
  res.send(`
  <h1>Invalid page </h1>
<a target="_blank" href="/login">Login page</a>;
  `);
});

module.exports = router;