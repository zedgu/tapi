#Tiny RESTful API frameworks - TAPI

- This is a tiny frameworks for RESTful API applications.
- TAPI bases on express.js.
- Designed for applications with express and mongoose, but not depends on mongoose.

##Install

    npm isntall tapi

##Simple Usage

###Suppose your files tree like this:
    -lib
    |-controllers
     |-Users.js
    |-medols
     |-Users.js
    -app.js

###then, in app.js:

    var express = require('express')
    , tapi = require('tapi')
    , mongoose = require('mongoose')
    , app = express();
    
    mongoose.connect('mongodb://user:pw@localhost/test');
    
    tapi.config({
	    libs: './lib',
	    prefix: '/api/version-1/'
    });
    
    app.use(app.router);
    app.api('/user/:id?', 'user.show', 'GET');
    app.listen(3000);

###in lib/controllers/Users.js:

    exports.show = function(req, res, next) {
	    this.send(200, this.medol);
	};

###in lib/medols/Users.js:

    var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , UsersSchema = new Schema({
	    nickname: String
	});
	
	module.exports = mongoose.model('Users', UsersSchema);

###when request '/api/version-1/user/1234', will responses default json format like this:

    {
        "request": "/api/version-1/user/1234",
        "code": 200,
        "message": "OK",
        "data": {
            "nickname": "XXXXXX"
            "_id": [57, 56 ...]
        }
    }

##Main Functions

###tapi.config(options)

    tapi.config({
        libs: String,  //dir path of controllers and medols, default "./lib"
        prefix: String //prefix for the dir path of route, default "/"
    })

###app.api(route, controller / controller.action [, method])

    app.api('/user/:id?', 'Users'); // only controller, default action mapping will be used, see `Actions Mapping` below.
    app.api('/posts/:id', 'Posts.show') // no HTTP method, default method 'all'(app.all()) will be used.
    app.api('/posts/new', 'Posts.create', 'post');

###this.send([code, ]response[, msg])

- default function for all controllers
- will format the 'response' data before res.send(), and will call res.send() automatically
- support ‘JSON' and 'XML' format, see `Format` below

Samples:

    this.send('All done.'); // default code '200', default message see `Default HTTP Status` below
    this.send(404, 'Nothing!');
    this.send(500, 'Errors', 'Wrong URL！')

##Settings

###Actions Mapping

    {
    	index: 'get',
    	latest: 'get',
    	create:  'post',
    	get: 'get',
    	update: 'put',
    	patch: 'patch',
    	del: 'del'
    }

###Format

####Format will be get automatically:

    format = req.body.format || req.params.format || 'json';

###Default HTTP Status

    {
    	'200': 'OK',
    	'201': 'Created',
    	'500': 'Internal Server Error. -- Unkown errors.',
    	'401': 'Unauthorized. -- Need to sign in.',
    	'402': 'Payment Required. -- Please pay your orders.',
    	'403': 'Forbidden. -- No permission to get the response from this request.',
    	'404': 'Not Found. -- Can not find your require path.',
    	'454': 'Unavailable Method. -- No such method within the api.'
    }