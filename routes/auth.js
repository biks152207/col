var express = require('express');
var session = require('express-session');
var router = express.Router();
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var jwt = require('jwt-simple');
var crypto = require('crypto');
var moment = require('moment');
var https = require('https');

var config = require('../config');

var db;
var mongoUrl = config.mongoUrl;
MongoClient.connect(mongoUrl, function (err, database) {
  if (err)
    throw err;
  db = database;
  console.log('coll opened in auth');
});
router.use(session({
  secret: 'uomcollab',
  resave: true,
  saveUninitialized: true,
  maxAge: new Date(Date.now() + 3600000),
  expires: new Date(Date.now() + 3600000)
}));

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, 'JWT Token Secret');
}

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.headers.authorization.split(' ')[1];
  var payload = null;
  try {
    payload = jwt.decode(token, 'JWT Token Secret');
  } catch (err) {
    return res.status(401).send({ message: err.message });
  }
  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}

/*
 |--------------------------------------------------------------------------
 | Login functionality
 |--------------------------------------------------------------------------
 */

router.post('/login',function(req,res){
	sess = req.session;
	db.collection('users',function(err,collection){
		if (err) {
	      res.send({message: 'nouser'});
	    }
	    if(req.body.username && req.body.password){
	    	collection.find({
	    		'username':req.body.username,
	    		'password':req.body.password
	    	}).toArray(function(err,items){
	    		if(items.length>0){
					sess.name = items[0].name;
          			sess.userid = items[0]._id;
          			sess.username = items[0].username;
          			sess.profilepic = items[0].profilepic ? items[0].profilepic : 'img/user_profile.jpg';
          			sess.email = items[0].email;
          			sess.sex = items[0].sex;
		          	sess.age = items[0].age;
		          	sess.api = items[0].api;
          			sess.logged = true;
	    			var token = createJWT(items[0]);
	    			sess.token = token;
	    			res.send({ token: createJWT(items[0]) });
	    		}else {
		          res.status(401).send({ message: 'Wrong email and/or password' });
		        }
	    	})
	    }
	});
});


 /*
 |--------------------------------------------------------------------------
 | Signup Required Middleware
 |--------------------------------------------------------------------------
 */

router.post('/signup',function(req,res){
	sess = req.session;
	console.log('registering the data');
	db.collection('users',function(err,collection){
		if (err) {
	      res.error(err);
	    }
	    if(req.body.username){
	    	collection.find({'username':req.body.username}).toArray(function(err,items){
	    		if(items.length > 0){
	    			res.send('User Already Exists');
	    		}else{
	    			var api_token = crypto.randomBytes(10).toString('hex');
	    			var registerData = {
			            'username': req.body.username,
			            'name': req.body.name,
			            'password':req.body.password,
			            'sex':req.body.sex,
			            'email':req.body.email,
			            'age':req.body.age,
			            'api': api_token
			        };
			        collection.insert(registerData,function(error,data){
			        	if (err) {
			              console.log('Error inputting data');
			            } else{
			            	/*
			            	sess.name = data.ops[0].name;
		          			sess.userid = data.ops[0]._id;
		          			sess.username = data.ops[0].username;
		          			sess.sex = data.ops[0].sex;
		          			sess.age = data.ops[0].age;
		          			sess.profilepic = data.ops[0].profilepic ? data.ops[0].profilepic : 'img/user_profile.jpg';
		          			sess.email = data.ops[0].email;
		          			sess.logged = true;
			    			var token = createJWT(data.ops[0]);
			    			sess.token = token;*/
			    			res.send('done');
			            }	
			        });
	    		}
	    	});
	    }
	});
})


//Returing modules
module.exports = router;