var express = require('express');
var router = express.Router();
const passport = require('passport');

// This app has no "home" page, but your projects should 😀
router.get('/', function(req, res, next) {
  res.redirect('/movies');
});

// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  'google',
  {
    scope: ['profile', 'email'],
  }
));

// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect: '/movies',
    failureRedirect: '/movies'
  }
));

// OAuth logout route
router.get('/logout', function(req, res){
  req.logout(function() {
    res.redirect('/movies');
  });
});

module.exports = router;
