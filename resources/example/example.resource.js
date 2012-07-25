var view_component = require('../../components/view');
var Resource = require('../../components/resource').Resource;

module.exports = new Resource('example', {
	construct : function () {
		var renderers = require('./example.renderers');
		var key = null;

		for (key in renderers) {
			console.log('adding renderer: ' + key);
			view_component.addRenderer(key, renderers[key]);
		}
	},
	onRequest : function (uri_bundle, view, route, route_resource) {
		if (uri_bundle.public) {
			var child = view.child('content');
			view.set('title', 'hello world');
			view.render('template.html');
			route.call(route_resource, uri_bundle, child);
		} else {
			route.call(route_resource, uri_bundle, view);
		}
	},
	router : require('./example.router'),
	dependencies : {
		"user" : require('../user/user.resource'),
		"blog" : require('../blog/blog.resource'),
		"static" : require('../static/static.resource')
	}
});