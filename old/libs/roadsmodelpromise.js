"use strict";

/**
* roadsmodelpromise.js
* Copyright(c) 2012 Aaron Hedges <aaron@dashron.com>
* MIT Licensed
 */

module.exports.mixin = function (ModelPromisePrototype) {
	var old_error = ModelPromisePrototype.error;

	ModelPromisePrototype.error = function (view) {
		if (view.statusError) {
			this._error = function (error) {
				view.statusError(error);
			};
		} else {
			old_error.call(this, view);
		}

		return this;
	};
	/*ModelPromisePrototype.view = function (view, template) {
		console.log('applying shit!');
		this.ready(model_ready(view, template));
		this.error(model_error(view));
		this.validationError(model_validationError(view));
	};*/
};


function model_ready (view, template) {
	if (template) {
		return function (result) {
			view.set('result', result);
			view.render(template);
		};
	} else {
		return function (result) {
			view.statusCreated();
		};
	}
}

function model_error (view) {
	return function (error) {
		view.statusError(error);
	};
}

function model_validationError (view, template) {
	if (template) {
		return function (invalid_fields) {
			view.set('invalid_fields', invalid_fields);
			view.render(template);
		};
	} else {
		return function (result) {
			view.statusInvalidRequest();
		};
	}
}