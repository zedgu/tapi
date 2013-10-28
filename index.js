var fs = require('fs')
, path = require('path')
, express = require('express')
, methods = require('methods')
, app = express.application
/**
 * For default route strategy.
 * @type {Object}
 */
, actionsMapping = {
	index: 'get',
	latest: 'get',
	create:  'post',
	get: 'get',
	update: 'put',
	patch: 'patch',
	del: 'del'
}
/**
 * Default status messages of responses.
 * @type {Object}
 */
, Status = {
	'200': 'OK',
	'201': 'Created',
	'500': 'Internal Server Error. -- Unkown errors.',
	'401': 'Unauthorized. -- Need to sign in.',
	'402': 'Payment Required. -- Please pay your orders.',
	'403': 'Forbidden. -- No permission to get the response from this request.',
	'404': 'Not Found. -- Can not find your require path.',
	'454': 'Unavailable Method. -- No such method within the api.'
}
/**
 * Tiny RESTful API lib
 * @param {String} route      express route path
 * @param {Object} controller object of controller
 * @param {Function} action   action function of controller
 * @param {String} method     HTTP method
 * @param {Object} app        instance of express
 */
, TAPI = exports.TAPI = function(route, controller, action, method, app) {
	this.app = app;
	this.route = path.join(exports.prefix, route);;
	this.controller = exports.controllers[controller];
	this.response = {
		json: function(req, code, msg, res) {
			return {
				request: req,
				code: code,
				message: msg,
				data: res
			};
		},
		xml: function(req, code, msg, res) {
			return '<?xml version="1.0" encoding="utf-8" ?><response><request>' + req + '</request><code>' + code + '</code><message>' + msg + '</message><data>' + res + '</data></response>';
		}
	};
	if (method) {
		method = method.toLowerCase();
		this.method = methods.indexOf(method) == -1 ? 'all' : method;
	} else {
		this.map();
		return;
	}
	if (this.controller[action]) {
		this.add(action);
		return;
	}
};
/**
 * To map default route strategy.
 */
TAPI.prototype.map = function() {
	for (var key in actionsMapping) {
		if (this.controller[key]) {
			this.add(key, actionsMapping[key]);
		}
	}
};
/**
 * To add route strategy.
 * @param {Function} action action of controller
 * @param {String} method HTTP method
 */
TAPI.prototype.add = function(action, method) {
	var self = this
	, method = method || this.method;
	this.app[method](this.route, function(req, res, next) {
		self.format = req.body.format || req.params.format || 'json';
		self.controller.send = self.send(req, res, self);
		self.controller[action](req, res, next);
	});
};
/**
 * To send formated response.
 * @param  {Object} req  req object of express
 * @param  {Object} res  res object of express
 * @param  {Object} self instance of TAPI
 * @return {Function}      real send function for action of the controller
 */
TAPI.prototype.send = function(req, res, self) {
	return function(code, response, msg) {
		if (code !== undefined && response === undefined) {
			arguments.callee(200, code);
			return;
		}
		res.type(self.format.toLowerCase());
		res.send(code, self.response[self.format](req.path, code, msg || Status[code.toString()] || 'Unkown error!', response));
	};
};

/**
 * To load controllers / medols.
 * @param  {String}   components 'controllers' or 'medols'
 * @return {Object}              objects of controllers / medols
 */
exports.load = function(components) {
	var re = {}
	, p = path.resolve(path.join(this.libs, '/', components))
	, files = fs.readdirSync(p);
	files.forEach(function(file) {
		file = path.join(p, '/', file);
		if (fs.statSync(file).isFile() && path.extname(file) == '.js') {
			re[path.basename(file, '.js')] = require(file);
		}
	});
	return re;
};
/**
 * Config function for TAPI
 * @param  {Object} options {libs: String, dir path of controllers and medols, prefix: String, prefix for the dir path of route}
 */
exports.config = function(options) {
	options = options || {libs: './lib', prefix: '/'};
	this.libs = options.libs;
	this.prefix = options.prefix;
	this.models = this.load('models');
	this.controllers = this.load('controllers');
	for (var key in this.controllers) {
		this.controllers[key].model = new this.models[key]();
	}
};
/**
 * Call this to add route strategy.
 * @param  {String} route    express VERB path
 * @param  {String} resource "controller" or "controller.action"
 * @param  {String} [method] HTTP method
 * @return {Object}          TAPI instance
 */
app.api = function(route, resource, method) {
	if (!exports.controllers) {
		exports.config();
	}
	resource = resource.split('.');
	this.apis = this.apis || {};
	var tapi = this.apis[resource] = new TAPI(route, resource[0], resource[1], method, this);
	return tapi;
};
