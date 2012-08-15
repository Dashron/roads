/*
* gfw.js - server.js
* Copyright(c) 2011 Aaron Hedges <aaron@dashron.com>
* MIT Licensed
*/
"use strict";

var http_module = require('http');
var url_module = require('url');
var qs_module = require('querystring');

var events_module = require('events');
var util_module = require('util');
var Cookie = require('./cookie').Cookie;

/**
 * [Server description]
 * @param {int} port     [description]
 * @param {string} hostname [description]
 * @todo  emit log info?
 */
var Server = exports.Server = function Server (description) {
	var _self = this;
	this.resource = description.resource;
	this.port = description.port || 8125;
	this.hostname = description.hostname || null;

	events_module.EventEmitter.call(_self);

	_self.server = http_module.createServer(function (request, response) {
		var cookie = new Cookie(request, response);
		var url = url_module.parse(request.url, true);

		// @todo what other methods need to be supported here?
		if (request.method === "POST") {
			var buffer = [];
			var post_data = null;

			request.on('data', function (data) {
				buffer.push(data);
			});

			request.on('end', function () {
				var post_data = exports.parsePostData(buffer.join(), request.headers['content-type']);
				var key = null;
				for (key in post_data) {
					url.query[key] = post_data[key];
				}

				_self.resource.request({
					method : request.method,
					uri : url.pathname,
					params : url.query,
					cookie : cookie,
					headers : request.headers,
					source : "server"
				}, response);
			});
		} else {
			_self.resource.request({
				method : request.method,
				uri : url.pathname,
				params : url.query,
				cookie : cookie,
				headers : request.headers,
				source : "server"
			}, response);
		}

		_self.emit('request', request, response);
	});
};

util_module.inherits(Server, events_module.EventEmitter);

Server.prototype.server = null;
Server.prototype.port = null;
Server.prototype.hostname = null;
Server.prototype.resource = null;

/**
 * [start description]
 * @return {undefined}
 */
Server.prototype.start = function () {
	var _self = this;
	_self.server.listen(_self.port, _self.hostname, function () {
		console.log('Server listening for ' + _self.hostname + " on port:" + _self.port);
	});
};

/**
 * Starts the server
 * @return {undefined}
 */
Server.prototype.stop = function () {
	this.server.close();
};

/**
 * [parsePostData description]
 * @param  {String} body         [description]
 * @param  {String} content_type [description]
 * @return {Object}
 */
exports.parsePostData = function (body, content_type) {
	content_type = content_type.split(';');

	switch (content_type[0].trim()) {
		case "application/x-www-form-urlencoded":
			return qs_module.parse(body);
		case "application/json":
			return JSON.parse(body);
		default:
			console.log(body);
			console.log(content_type);
			throw new Error("content type not supported");
	}
};