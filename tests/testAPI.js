"use strict";

var Resource = require('../lib/resource');
var API = require('../lib/api');
var url_module = require('url');
var Promise = require('bluebird');

/**
 * Create a mock resource
 * 
 * @param  {[type]} methods   [description]
 * @param  {[type]} resources [description]
 * @return {[type]}           [description]
 */
function createResource (methods, resources) {
	var endpoint = function (method) {
		return function* (url, body, headers) {
			return {
				path : url.path,
				method : method,
				body : body,
				headers : headers
			};
		};
	};

	var definition = {
		methods : {
		}
	};

	if (methods) {
		methods.forEach(function (method) {
			definition.methods[method] = endpoint(method);
		});
	}

	if (resources) {
		definition.resources = resources;
	}

	return new Resource(definition);
}

/**
 * Ensure that we can find the proper resource for a url
 * 
 * @param  {[type]} test [description]
 * @return {[type]}      [description]
 */
exports.testlocateResource = function (test) {
	var resource = createResource(['GET']);
	var api = new API(resource);

	test.equal(resource, api._locateResource(url_module.parse('/')));
	test.done();
};

/**
 * Ensure that generators that are provided to createCoroutine become coroutines
 */
exports.testCreateValidCoroutine = function (test) {
	var resource = createResource(['GET']);
	var api = new API(resource);
	var return_val = "very specific string";

	api._createCoroutine(function* () {
		yield new Promise(function (resolve, reject) {
			resolve();
		});

		return return_val;
	})().then(function (val) {
		test.equals(val, return_val);
		test.done();
	}).catch(function (e) {
		// this shouldn't be reached
		test.ok(false);
		test.done();
	});
};

/**
 * Ensure that non-generators that are provided to createCoroutine are passed through unchanged
 */
exports.testCreateFunctionCoroutine = function (test) {
	var resource = createResource(['GET']);
	var api = new API(resource);
	var fn = function () {
		return true;
	};

	test.equals(api._createCoroutine(fn), fn);
	test.done();
};

/**
 * Ensure that success routes return promises
 */
exports.testSuccessLocateRoute = function (test) {
	var resource = new Resource({
		methods : {
			GET : function (url, body, headers) {
				return {
					path : url.path,
					method : 'GET',
					body : body,
					headers : headers
				};
			}
		}
	});

	var api = new API(resource);
	var route = api._locateRoute(url_module.parse('/'), 'GET');

	test.deepEqual({
		path : '/',
		method : 'GET',
		body : 'b',
		headers : 'c'
	}, route({path : '/'}, 'b', 'c'));

	test.done();
};

/**
 * Ensure that success routes return promises
 */
exports.testSuccessLocateCoroutineRoute = function (test) {
	var resource = createResource(['GET']);

	var api = new API(resource);
	var route = api._locateRoute(url_module.parse('/'), 'GET');

	route({path : '/'}, 'b', 'c')
		.then(function (result) {
			test.deepEqual({
				path : '/',
				method : 'GET',
				body : 'b',
				headers : 'c'
			}, result);

			test.done();
		}).error(function (e) {
			// this should never happen
			test.ok(false);
			test.done();
		});
};

/**
 * Ensure that fail routes throw exceptions
 */
exports.testInvalidPathLocateRoute = function (test) {
	var resource = createResource(['GET']);
	var api = new API(resource);

	var route = api._locateRoute(url_module.parse('/stuff'), 'GET');

	try {
		route({path : 'a'}, 'b', 'c');
	} catch (e) {
		test.equal(e.code, 404);
		test.equal(e.message, '/stuff');

		test.done();
	}
};

/**
 * Ensure we get a proper failed method route
 */
exports.testInvalidMethodLocateRoute = function (test) {
	var resource = createResource(['GET']);
	var api = new API(resource);

	var route = api._locateRoute(url_module.parse('/'), 'POST');

	try {
		route({path : 'a'}, 'b', 'c');
	} catch (e) {
		test.equal(e.code, 405);
		test.deepEqual(e.message, ['GET']);

		test.done();
	}
};


/**
 * We need to do a bunch of stuff here
 */
exports.testServer = function (test) {
	// incomplete
	test.done();
};