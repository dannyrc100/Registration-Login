const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

// DeprecationWarning: mpromise is deprecated, plug in your own promise library
mongoose.Promise = global.Promise;

// Connect to Mongoose Database
mongoose.connect(config.database, {
  useMongoClient: true
});
let db = mongoose.connection;

// Check Connection
db.once('open', function () {
  console.log('Connected to MongoDB... Yay!!!');
});

// Check for DB errors
db.on('error', function (err) {
  console.log(err);
});

// Initialize Application
const app = express();

// Bring in Models
let Article = require('./models/article.js');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express-Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

// Express-Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express-Validator Middleware
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.');
    root = namespace.shift();
    formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', function (req, res) {
  Article.find({}, function (err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }
  });
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

//=============================================
// THIS IS STATIC DATA TEST
// let articles = [
//   {
//     id: 1,
//     title: 'Articulito One',
//     author: 'Brad Traversy',
//     body: 'This is article one'
//   },
//   {
//     id: 2,
//     title: 'Articulon Two',
//     author: 'John Doe',
//     body: 'This is article two'
//   },
//   {
//     id: 3,
//     title: 'Articulote Three',
//     author: 'Leo Messi',
//     body: 'This is article three'
//   }
// ];
//=============================================


// Start Server
app.listen(3000, function () {
  console.log('Server started on port 3000...');
});