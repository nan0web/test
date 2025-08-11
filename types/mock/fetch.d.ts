export default mockFetch;
/**
 * Creates a mock fetch function based on the provided routes.
 * @param {Array<[string, (Object|Array|Function)]>} routes - Route patterns with their corresponding responses.
 * @returns {Function} An async function that mimics the fetch API.
 *
 * @example
 * const routes = [
 *   ['GET /users', { id: 1, name: 'John Doe' }],
 *   ['POST /users', [201, { id: 2, name: 'Jane Smith' }]],
 * ];
 * const fetch = mockFetch(routes);
 * const response = await fetch('/users');
 * const data = await response.json();
 */
declare function mockFetch(routes: Array<[string, (any | any[] | Function)]>): Function;
