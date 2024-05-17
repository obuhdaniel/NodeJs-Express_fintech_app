var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const User = require('./models/user');
const Account = require('./models/account');
const bcrypt = require('bcryptjs');

require('dotenv').config();


//session

const session = require('express-session');

const sessionConfig = {
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set to true for https connections
}

app.use(session(sessionConfig));
app.use(express.json());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(__dirname + '/images'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static('/public/images'));

const imagePath = path.join(__dirname, 'public/images', 'landing.png');
console.log(imagePath);




app.post('/signup', async (req,res) =>{
  
  
  try {

    const generateUniqueNumber = async () => {
      let accountNo;
      do {
        // Generate a random 8-digit number (excluding the leading 555)
        const randomPart = Math.floor(Math.random() * 90000000) + 10000000;
        accountNo = '555' + randomPart;
      } while (await Account.exists({ accountNo })); // Check for uniqueness
  
      return accountNo;
    };
    // Validate user data (add validation logic here)
    const { firstName, lastName, email, password, phone, date_birth, nin} = req.body;

    console.log('req.body');

    // Create a new user instance
    

    // Save the new user to the database

    const newAccount = new Account({
      accountName: lastName,
      accountNo: await generateUniqueNumber(),
      accountType: 'Savings', // Default account type
      balance: 0,
      creditBalance: 0,
      debitBalance: 0// Default balance
      });
    savedAccount = await newAccount.save();

    if (savedAccount){

    const newUser = new User({  account: newAccount._id, firstName, lastName, email, password, phone, date_birth, nin});
    console.log(lastName,firstName,phone, date_birth);

    const savedUser = await newUser.save();

    res.redirect('/login');
    }


  // Update user's accounts list


    // Consider sending a success message or redirecting to a confirmation page
  } catch (error) {
    console.error('Error creating user:', error);

    // Handle registration errors appropriately
    let errorMessage = 'An error occurred during registration.';
    if (error.code === 11000) { // Handle duplicate key errors (e.g., username or email already exists)
      errorMessage = 'Username or email already in use.';
    }
    res.status(400).json({ message: error }); // Send an error response with a clear message
  }


});

app.get('/signup', (req,res)=>{
  res.render('signup');
});

app.get('/login', (req,res)=>{
  res.render('login');
})



app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by username
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('No users record found');
    }

    // Compare passwords (use bcrypt.compare)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Wrong Password');
    }

    // Login successful (store user ID in session, redirect to profile)
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({ message: `${error}`});
  }
});



// Middleware to check for authenticated user
async function ensureAuthenticated(req, res, next) {
      if (!req.session.userId) {
        console.log('No userId in session');
        return res.redirect('/login'); // Or handle unauthorized access
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            console.log('User not found');
            return res.redirect('/login'); // Or handle user not found
        }
        req.user = user; // Attach user to request object
        console.log(`User authenticated: ${req.user._id}`);
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.redirect('/login'); // Or handle authentication error
    }

}


app.get('/dashboard', ensureAuthenticated, async(req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('account');
    if (!user) {
        return res.status(404).render('error', { message: 'User not found' });
    }
    console.log(user._id);
    res.render('dashboard', { account: user.account});
} catch (error) {
    res.status(500).render('error', { message: error.message });
    console.log(error)
}
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(); // Destroy user session
  res.redirect('/');
});



app.get('/services/send', ensureAuthenticated, (req, res) => {
   
  res.render('send')
});

app.get('/services/history', ensureAuthenticated, (req, res) => {
   
  res.render('history')
});
app.get('/services/settings', ensureAuthenticated, (req, res) => {
   
  res.render('settings')
});
app.get('/services/educate', ensureAuthenticated, (req, res) => {
   
  res.render('educate')
});
app.get('/services/remittance', ensureAuthenticated, (req, res) => {
   
  res.render('remit')
});
app.get('/services/pay-bills', ensureAuthenticated, (req, res) => {
   
  res.render('pay')
});
app.get('/services/help', ensureAuthenticated, (req, res) => {
   
  res.render('help')
});
app.get('/services/loans', ensureAuthenticated, (req, res) => {
   
  res.render('loans')
});

//Mongo db init

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));
}















// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
