const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('./controler/passport');
const hbs = require('hbs');
const path = require('path');
const templatepath = path.join(__dirname, "./templates");
const connectDB = require('./controler/signadb');

const app = express();

try{
  connectDB();
}catch(err){
  console.log('not connected ')
}


app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'hbs');
app.set('views', templatepath);

const indexRouter = require('./src/index');
app.use('/', indexRouter);

app.listen(5000, () => {
  console.log(`Server started on http://localhost:5000`);
});
