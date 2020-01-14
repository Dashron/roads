/**
 * road.js
 * Copyright(c) 2020 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 * Exposes the core Road class
 */
import * as response_lib from './response';
import Response from './response';
export interface Middleware {
    (this: Context, method: string, path: string, body: string, headers: {
        [x: string]: any;
    }, next: ResponseMiddleware): Promise<Response>;
}
export interface Context {
    request: Function;
    Response: response_lib.ResponseConstructor;
    [x: string]: any;
}
export interface ResponseMiddleware {
    (): Promise<Response>;
}
/**
 * See roadsjs.com for full docs.
 *
 * @name Road
 */
export default class Road {
    protected _request_chain: Middleware[];
    /**
     * Road Constructor
     *
     * Creates a new Road class. This function does not accept any parameters!
     */
    constructor();
    /**
     * Add one or many custom functions to be executed along with every request.
     *
     * The functions added will be executed in the order they were added. Each handler must execute the "next" parameter if it wants to continue executing the chain.
     *
     * name | type                                                                  | required | description
     * -----|-----------------------------------------------------------------------|----------|---------------
     * fn   | Function(*string* method, *string* url,*string* body,*object* headers,*function* next) | yes      | Will be called any time a request is made on the object.
     *
     * This will be called for every request, even for routes that do not exist. The callback will be executed with the following five parameters :
     *
     * Callback
     * **function (*string* method, *string* url, *string* body, *Object* headers, *Function* next)**
     *
     * name     | type                               | description
     * --------|------------------------------------|---------------
     * method  | string                             | The HTTP method that was provided to the request
     * url     | string                             | The URL that was provided to the request
     * body    | string                             | The body that was provided to the request
     * headers | object                             | The headers that were provided to the request
     * next    | function                           | The next step of the handler chain. If there are no more custom handlers assigned, next will resolve to the [resource method](#resource-method) that the router located. This method will always return a promise.
     *
     * If the callback does not return a [response](#roadsresponse) object, it will be wrapped in a [response](#roadsresponse) object with the default status code of 200.
     *
     * @param {Function} fn - A callback (function or async function) that will be executed every time a request is made.
     * @returns {Road} this road object. Useful for chaining use statements.
     */
    use(fn: Middleware): Road;
    /**
     *
     * Execute the resource method associated with the request parameters.
     *
     * This function will locate the appropriate [resource method](#resource-method) for the provided HTTP Method and URL, execute it and return a [thenable (Promises/A compatible promise)](http://wiki.commonjs.org/wiki/Promises/A). The thenable will always resolve to a [Response](#roadsresponse) object.
     *
     * @param {string} method - HTTP request method
     * @param {string} url - HTTP request url
     * @param {string} [body] - HTTP request body
     * @param {object} [headers] - HTTP request headers
     * @returns {Promise} this promise will resolve to a Response object
     */
    request(method: string, url: string, body?: string, headers?: object): Promise<Response>;
    /**
     * Turn an HTTP request into an executable function with a useful request context. Will also incorporate the entire
     * request handler chain
     *
     * @param {string} request_method - HTTP request method
     * @param {string} path - HTTP request path
     * @param {string} request_body - HTTP request body
     * @param {object} request_headers - HTTP request headers
     * @param {Context} context - Request context
     * @returns {NextMiddleware} A function that will start (or continue) the request chain
     */
    protected _buildNext(request_method: string, path: string, request_body: string | undefined, request_headers: object | undefined, context: Context): ResponseMiddleware;
    /**
     * Execute a resource method, and ensure that a promise is always returned
     *
     * @param {Function} route
     * @returns {Promise<Response>}
     */
    protected _executeRoute(route: ResponseMiddleware): Promise<Response>;
}
