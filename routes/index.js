var express = require('express');
var session = require('express-session');
var config = require('../config');
var router = express.Router();
router.use(session({
  secret: 'uomcollab',
  resave: true,
  saveUninitialized: true,
  maxAge: new Date(Date.now() + 3600000),
  expires: new Date(Date.now() + 3600000)
}));

/* GET home page. */
router.get('/', function(req, res) {
	console.log('testing route');
	sess = req.session;
  	console.log(sess);
  	if(sess.logged){
  		var details = {
  			basePath: config.basePath,
  			userid: sess.userid,
  			username: sess.username,
  			name:sess.name,
  			email:sess.email,
  			sex: sess.sex,
  			age: sess.age,
  			api: sess.api,
  			profilepic:sess.profilepic
  		}
  		res.render('index.html',details);
  	}else{
  		res.render('login.html',{basePath: config.basePath});
  	}
});
router.get('/login',function(req,res){
  res.render('login.html',{basePath:config.basePath});
});

router.get('/home',function(req,res){
	res.render('index.html');
});

router.get('/logout', function (req, res) {
  /*
  sess = req.session;
  sess.logged = false;
  console.log(sess);
  req.session.destroy();
  console.log(sess);
  res.redirect('/');*/
  sess = req.session;
  sess.logged = false;
  req.session.destroy();
  console.log(req.session);
  res.redirect('/');
});

module.exports = router;
