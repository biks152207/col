var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var moment = require('moment');
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var config = require('../config');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();

var db;
var mongoUrl = config.mongoUrl;

MongoClient.connect(mongoUrl, function (err, database) {
  if (err)
    throw err;
  db = database;
  console.log('coll opened');
});

router.post('/emails',function(req,res){
  db.collection('emails', function (err, collection) {
    console.log(req.body);
    if(req.body.member == "true"){
      collection.insert(req.body, function (err, data) {
        if (err) {
          res.send('Error inputting data');
        } else {
          res.send(data);
        }
      });
    }else{
      transporter.sendMail({
        from: req.body.from_email,
        to: req.body.to_email,
        subject: req.body.subject,
        text: req.body.body
      });
      collection.insert(req.body, function (err, data) {
        if (err) {
          res.send('Error inputting data');
        } else {
          res.send(data);
        }
      });
    }
  });
})

router.get('/:table', function (req, res) {
  db.collection(req.params.table, function (err, collection) {
    if (err) {
      res.send('Not found');
    }
    collection.find(req.query).toArray(function (err, items) {
      if (err) {
        res.send('not found');
      } else {
        res.send(items);
      }
    });
  });
});

router.get('/:table/:id', function (req, res) {
  db.collection(req.params.table, function (err, collection) {
    if (err) {
      res.send('Not found');
    }
    collection.find({ '_id': new ObjectId(req.params.id) }).toArray(function (err, items) {
      res.send(items[0]);
    });
  });
});

router.post('/:table', function (req, res) {
  db.collection(req.params.table, function (err, collection) {
    collection.insert(req.body, function (err, data) {
      if (err) {
        res.send('Error inputting data');
      } else {
        res.send(data);
      }
    });
  });
});

router.put('/:table/:id', function (req, res) {
  db.collection(req.params.table, function (err, collection) {
    if (req.body._id) {
      delete req.body._id;
    }
    collection.update({ '_id': new ObjectId(req.params.id) }, req.body, function (err, data) {
      if (err) {
        res.send('Error changing data');
      } else {
        res.send(data);
      }
    });
  });
});

router.delete('/:table/:id', function (req, res) {
  req.params.api = req.headers.api;
  db.collection(req.params.table, function (err, collection) {
    collection.remove({'_id':new ObjectId(req.params.id)},function(err,data){
      if (err) {
        res.send('Error inputing data');
      } else {
        res.send(data);
      }
    });
  });
});

module.exports = router;