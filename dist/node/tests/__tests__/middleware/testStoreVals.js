"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const storeVals = index_1.Middleware.storeVals;
describe('Store Values', () => {
    test('test storeVal and getVal functions are properly applied to middleware', () => {
        expect.assertions(2);
        const context = {};
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        storeVals.call(context, 'a', 'b', 'c', {}, function () { });
        expect(typeof (context.storeVal)).toEqual('function');
        expect(typeof (context.getVal)).toEqual('function');
    });
    /**
     * Test that the title is properly set to the request context
     */
    test('test storeVal and getVal work as expected', () => {
        expect.assertions(1);
        const context = {};
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        storeVals.call(context, 'a', 'b', 'c', {}, function () { });
        context.storeVal('foo', 'bar');
        expect(context.getVal('foo')).toEqual('bar');
    });
});
