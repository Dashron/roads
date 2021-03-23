
import { Road } from '../../../index';
import { Context } from '../../../core/road';

interface confirmContext {
	confirmString: () => string
}

describe('Road Context', () => {
	/**
	 * Ensure that the request context is the context provided in the Road constructor
	 */
	test('Road Context Contains Request Method', () => {
		expect.assertions(1);

		const response_string = 'blahblahwhatwhatwhat';
		const road = new Road();

		road.use(async function (method, url, body, headers) {
			switch (method) {
				case 'GET':
					return this.request('POST', '/');
				case 'POST':
					return response_string;
				default:
					throw new Error('not supposed to happen');
			}
		});

		return expect(road.request('GET', '/')).resolves.toEqual({
			status: 200,
			body: response_string,
			headers: {}
		});
	});

	/**
	 * Ensure that the request context is the context provided in the Road constructor
	 */
	test('Road Context Persists', () => {
		expect.assertions(1);
		const response_string = 'blahblahwhatwhatwhat';

		const road = new Road();

		road.use(function (method, url, body, headers, next) {
			this.confirmString = function () {
				return response_string;
			};

			return next();
		});

		road.use(function (this: Context & confirmContext, method, url, body, headers, next) {
			return this.confirmString();
		});

		return expect(road.request('GET', '/')).resolves.toEqual({
			status: 200,
			body: response_string,
			headers: {}
		});
	});

	/**
	 * Ensure that the request context is the context provided in the Road constructor
	 */
	test('Road Async Context Persists', () => {
		expect.assertions(1);

		const response_string = 'blahblahwhatwhatwhat';

		const road = new Road();

		road.use(async function (method, url, body, headers, next) {
			this.confirmString = function () {
				return response_string;
			};

			return await next();
		});

		road.use(function (this: Context & confirmContext, method, url, body, headers, next) {
			return this.confirmString();
		});

		return expect(road.request('GET', '/')).resolves.toEqual({
			status: 200,
			body: response_string,
			headers: {}
		});
	});

	/**
	 * Ensure that contexts are only added once to a resource.
	 */
	test('Road Async Uniqueness', () => {
		expect.assertions(1);
		const road = new Road();

		road.use(async function (method, url, body, headers, next) {
			return await next();
		});

		expect(road['_request_chain'].length).toEqual(1);
	});
});