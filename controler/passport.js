const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./signadb');
const express = require('express')
const app = express();



// passport.use(new LocalStrategy(
  
//   function(email,password, done) {
    
//     User.findOne({ email: email }, function(err, user) {
//       if (err) { 
//         console.log('error from passportjs line : 10')
//         return done(err);
//        }
//       if (!user) {
//         console.log('!user error from passportjs')
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!bcrypt.compareSync(password, user.password)) {
//         console.log('password does not match')
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));

passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async function(email, password, done) {
    try {
      const user = await User.findOne({ email: email }).exec();
      if (!user) {
        console.log('!user error from passportjs');
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('password does not match');
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      console.log('error from passportjs line : 10');
      return done(err);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.email);
});

// passport.deserializeUser(function(email, done) {
//   User.findOne({ email: email }, function(err, user) {
//     done(err, user);
//   });
// });

passport.deserializeUser(async function(email, done) {
  try {
    const user = await User.findOne({ email: email }).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

module.exports = passport;
