const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');


router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/register',[
    check('name').custom((value, { req }) => {
        if(value === '' || value === null) {
            throw new Error('Name cannot be empty');
        }  else {
            return value;
        }
    }),
    check('username').custom((value, { req }) => {
        if(value === '' || value === null) {
            throw new Error('Username cannot be empty');
        } else {
            return value;
        }
    }),
    check('email').isEmail().withMessage('must be an email').trim().normalizeEmail(),
    check('password', 'Password must be 5 characters long')
    .exists()
    .isLength({min: 5}),
    check('password2', 'Passwords do not match')
    .exists()
    .isLength({min: 5}).
    custom((value, { req }) => value === req.body.password )
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {        
    return res.render('register', {
        errors: errors.mapped()
    });
   }
    
    let newUser = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });

    User.createUser(newUser, (err, user) => {
        if(err) throw err;
        console.log(user);  
    });
    req.flash('success_msg', 'You are now registered and can now login');
    res.redirect('/users/login');
});

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.getUserByUsername(username, function(err, user) {
        if(err) throw err;
        if(!user) {
            return done(null, false, {message: 'Unknown User'});
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                message: 'Incorrect Password!!!'});
            }
        }); 
    });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.getUserById(id, function(err, user) {
          done(err, user);
        });
      });

router.post('/login',
  passport.authenticate('local', {
      successRedirect: '/', 
      failureRedirect: '/users/login', 
      failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', (req, res) => {
    req.logout();

    req.flash('success_msg', 'You are now logged out');
    res.redirect('/users/login');
})

module.exports = router;