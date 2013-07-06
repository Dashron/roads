"use strict";

var locate_user = function (request, view, next) {
	this.resource('official/user').model('session').getUser(request)
		.ready(function (user) {
			request.user = user;
			next(request, view);
		})
		.error(view);
};

module.exports = {
	main : {
		GET : function (request, view, next) {
			locate_user.call(this, request, view, function (request, view) {
				var child = view.child('content');
				var this_resource = this;

				view.render('template.html');

				if (request.next_route) {
					next(request, child, function (request, next) {
						this_resource.request(request.next_route);
					});
				} else {
					next(request, child);
				}
			});
		},
		POST : locate_user,
		PATCH : locate_user,
		PUT : locate_user,
		DELETE : locate_user,
	}
};