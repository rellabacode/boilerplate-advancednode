'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const pug = require('pug');
const {query} = require("mongodb/lib/core/wireprotocol");
const app = express();
const passport = require('passport');
const session = require('express-session');
const ObjectID = require('mongodb').ObjectID;
const morgan = require('morgan');


fccTesting(app); //For FCC testing purposes
app.use(morgan('combined'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'pug');

/*
connect.sid=s:YR2Xpbe1IwWGbgONcjuOqSw9Wz6m7hyf.xlQUcPEtEFdzQqLV8jeruPMnm0Hx/DN9geHnSIhDVf4; Path=/; HttpOnly
Content-Length: 534
Content-Type: text/html; charset=utf-8
*/

// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: true,
//     saveUninitialized: true,
//     cookie: {secure: false}
// }));

myDB(async client => {

    app.route('/').get((req, res) => {
        res.render(process.cwd() + "/views/pug/index", {title: 'Hello', message: 'Please login'});
    });

//persistent login session
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        myDB.findOne({_id: new ObjectID(id)}, (err, doc) => {
            done(null, doc);
        });
    });
}).catch(e => {
    app.route('/').get((req, res) => {
        res.render(process.cwd() + "/views/pug/index", {title: e, message: 'Unable to login'});
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
