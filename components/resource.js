"use strict";
var fs_module = require('fs');
var url_module = require('url');
var mongoose_module = require('mongoose');

var View = require('./view').View;

var Firebug = require('./firenode/firenode').Firebug;

var _resources = {};

/**
 * @param {String} name
 */
var Resource = exports.Resource = function Resource (name) {
	this.name = name;
	this.config = {};
	this.router = {};
	this.models = {};
	this.resources = {};
	this.db = null;
	this.unmatched_route = null;
};

/**
 * A string representing the name of the resource used in locating associated
 * files
 * 
 * @type {String}
 */
Resource.prototype.name = "";

/**
 * A boolean representing the loaded state of the resource
 * 
 * @type {Boolean}
 */
Resource.prototype.loaded = false;

/**
 * 
 */
Resource.prototype.directory = '';

/**
 * A collection of configuration data, key: value
 * 
 * @type {Object}
 */
Resource.prototype.config = null;

/**
 * A router for this resource
 * 
 * @type {Object}
 */
Resource.prototype.router = null;

/**
 * A collection of all models this resource depends on, name: model
 * 
 * @type {Object}
 */
Resource.prototype.models = {};

/**
 * A collection of all resources this resource depends on, name: resource
 * 
 * @type {Object}
 */
Resource.prototype.resources = null;

/**
 * 
 * @type {Mongoose}
 */
Resource.prototype.db = null;

/**
 * 
 * @type {Function}
 */
Resource.prototype.unmatched_route = null;

/**
 * 
 * @param {Mongoose} connection
 */
Resource.prototype.setDb = function (connection) {
	this.db = connection;
};

/**
 * Loads a resources configuration, dependencies, routes and models
 * @param {Object} config
 */
Resource.prototype.load = function (config) {
	var _self = this;

	if (_self.loaded) {
		return;
	}

	_self.directory = __dirname.replace("components", "") + "resources/" + _self.name;

	// If no configuration values are provided, try loading from the default directory
	if(typeof config != "object") {
		config = fs_module.readFileSync(_self.directory + "/" + _self.name + ".config.json", 'utf8');
		config = JSON.parse(config);
	}

	// Load the config and dependencies
	_self.config = config;
	_self.loadDependencies();

	// Load the routes
	var router_file = require(_self.directory + "/" + _self.name + ".routes");
	_self.router = new (router_file.Router)();

	// Load the unmatched route function
	if (typeof router_file.unmatched === "function") {
		_self.unmatched_route = router_file.unmatched;
	}

	// Load the db connection
	if (typeof _self.config.db === "object" && typeof _self.config.db.connection === "string") {
		var conn = mongoose_module.createConnection(_self.config.db.connection);
		_self.setDb(conn);
		
		var name = '';
		for(name in _self.resources) {
			_self.resources[name].setDb(conn);
		}
		
		_self.loadModels(require(_self.directory + "/" + _self.name + ".models"));
	}

	_self.loaded = true;
};

/**
 * 
 * @param {Module} module
 */
Resource.prototype.loadModels = function (module) {
	var _self = this;

	var keys = Object.keys(module);
	keys.forEach(function (key) {
		_self.models[key] = _self.db.model(key, module[key]);
	});
};

/**
 * Build all dependent resources, and load references into this resource
 */
Resource.prototype.loadDependencies = function () {
	var _self = this;

	if (_self.loaded || (typeof _self.config["dependencies"] == "undefined" || _self.config["dependencies"] == null)) {
		return;
	}

	_self.config.dependencies.forEach(function (resource_name) {
		_self.resources[resource_name] = exports.get(resource_name);
	});
};

/**
 * 
 * @param {String} template
 * @returns {View}
 */
Resource.prototype.buildView = function (template) {
	var _self = this;

	var view = new View(template);
	view.setDir(_self.directory + '/templates');
	return view;
};

/**
 * 
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 * @param {Object} extra
 * @param {Function} callback
 */
Resource.prototype.routeRequest = function (request, response, extra, callback) {
	var _self = this;
	var routed = false;

	if (_self.config.debug === true && typeof extra.logger === "undefined") {
		// TODO:fix this
		// logger = new Firebug(response);
		// extra.logger = logger;
	}

	if (_self.router.route(request, response, extra, callback)) {
		routed = true;
	} else {
		for ( var i in _self.resources) {
			if (_self.resources[i].routeRequest(request, response, extra, callback)) {
				routed = true;
			}
		}
	}

	if (routed === false && typeof _self.unmatched_route === "function") {
		request.url = url_module.parse(request.url, true);

		_self.unmatched_route(request, response, extra, callback);
	}
};

/**
 * Free up the memory of all resources built within this module
 */
var clearResources = exports.clearResources = function () {
	_resources = {};
};

/**
 * Build a single resource by name, and ensure a single reference
 * @param {String} name
 * @param {Object} config
 * @return {Resource}
 */
var get = exports.get = function (name, config) {
	if (typeof _resources[name] == "undefined" || _resources[name] == null) {
		_resources[name] = new Resource(name);
		_resources[name].load(config);
		
	}

	return _resources[name];
};