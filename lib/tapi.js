var fs = require('fs'),
	Status = {
		'200': 'OK',
		'500': 'Internal Server Error. -- Unkown errors.',
		'401': 'Unauthorized. -- Need to sign in.',
		'402': 'Payment Required. -- Please pay your orders.',
		'403': 'Forbidden. -- No permission to get the response from this request.',
		'404': 'Not Found. -- Can not find your require path.',
		'454': 'Unavailable Method. -- No such method within the api.'
	},
	tapi = function(rootPath, res) {
		this.rootPath = rootPath || '';
		this.res = res;
		this.response = {
			request: '',
			code: 200,
			msg: 'OK',
			data: []
		};
	};
tapi.prototype.next = function(options, next) {
	options.code = options.code || 200;
	options.msg = options.msg || Status[options.code.toString()];
	
	this.setResponse(options);
	this.res.json(this.response.code, this.response);
};
tapi.prototype.setResponse = function(options) {
	for (var key in options) {
		this.response[key] = options[key];
	}
};
tapi.prototype.safetyRequire = function(requirePath, req, res, next) {
	try {
		var ctrl = require(requirePath);
		ctrl[req.method.toLowerCase()](req, res, next);
	} catch(e) {
		next({code: 404});
	}
};

exports.render = function(req, res, next) {
	var api = new tapi(exports.root, res),
	path = [api.rootPath, req.params.version, 'controllers', req.params.resource + '.js'].join('/');
	api.setResponse({
		request: path.replace(/\.js$/, '')
	});
	api.safetyRequire(path, req, res, function(options) {
		api.next(options, next);
	});
};
exports.root = '';
