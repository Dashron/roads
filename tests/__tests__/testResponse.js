"use strict";

const roads = require('../../index.js');

describe('response tests', () => {
	/**
	 * Test that the constructor fields are accessible by the proper attributes.
	 */
	test('Constructor applies to body', () => {
		expect.assertions(3);
		let response_data = { message : "hello" };
		let headers = {hello: "there"}
		let res = new roads.Response(response_data, 200, headers);

		expect(res.body).toEqual(response_data);
		expect(res.status).toEqual(200);
		expect(res.headers).toEqual(headers);
	});
});