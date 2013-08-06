"use strict";

module.exports = {
	many : {
		GET : function (request, view) {
			var post_request = null;
			var _self = this;

			if (request.url.query.user) {
				this.project('official/user').model('user').load(request.url.query.user)
					.ready(function (user) {
						if (user) {
							_self.model('post').getForUser(user).preload('user_id')
								.ready(function (posts) {
									view.set('posts', posts);
									view.render('many.html');
								})
								.error(view);
						} else {
							view.statusNotFound();
						}
					})
					.error(view);
			} else {
				_self.model('post').getAll().preload('user_id')
					.ready(function (posts) {
						if (request.user) {
							view.set('authenticated_user', request.user);
							view.child('add').render('add.html');
						}

						view.set('posts', posts);
						view.render('many.html');
					})
					.error(view);
			}
		},
		POST : function (request, view) {
			var _self = this;

			if (request.user) {
				var post = new (_self.model('post')).Model();
				post.title = request.body.title;
				post.body = request.body.body;
				post.user_id = request.user.id;

				post.save()
					.ready(function (post) {
						view.statusRedirect('/');
					})
					.error(view)
					.validationError(function (errors) {
						view.set('invalid_fields', errors);
						view.render('add.html');
					});
			} else {
				view.statusUnauthorized();
			}
		}
	}, 
	one : {
		GET : function (request, view) {
			var _self = this;

			if (!request.url.query.id) {
				return view.statusNotFound();
			}

			_self.model('post').load(request.url.query.id)
				.preload('user_id')
				.ready(function (post) {
					view.set('post', post);
					console.log(post);
					if (request.user && request.user.id === post.user_id) {
						view.render('one.auth.html');
					} else {
						view.render('one.html');
					}
				})
				.error(view);
		},
		DELETE : function (request, view) {
			var _self = this;
			
			if (!request.url.query.id) {
				return view.statusNotFound();
			}

			if (!request.user) {
				return view.statusUnauthorized();
			}

			_self.model('post').load(request.url.query.id)
				.ready(function (post) {
					if (post.user_id !== request.user.id) {
						return view.statusUnauthorized();
					} else {
						post.delete()
							.ready(function () {
								view.statusRedirect('/posts');
							})
							.error(view);
					}
				})
				.error(view);
		},
		PATCH : function (request, view) {

		}
	},
};