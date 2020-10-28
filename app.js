const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
mongoose.connect('mongodb://localhost:27017/loginapp');
var db = mongoose.connection;
const morgan = require('morgan');
const winston = require('./config/winston');


var app = express();
app.use(morgan('combined', { stream: winston.stream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


const routes = require('./routes/index');
const users = require('./routes/users');


app.set('views',path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');


app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());


app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});


app.use('/', routes);
app.use('/users', users);


app.set('port',(process.env.PORT || 3000));

app.listen(app.get('port'), () => {
    console.log('Started on port ' + app.get('port'));
    
});

