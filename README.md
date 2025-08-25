# @nan0web/test

A test package with simple utilities for testing in node.js runtime.

## Install
```bash
npm install @nan0web/test
```

## Usage

Example usage of mockFetch and MemoryDB
```js
import { mockFetch, MemoryDB } from '@nan0web/test'

// ✅ Create a mock fetch function
const fetch = mockFetch([
	['GET /users', { id: 1, name: 'John Doe' }],
	['POST /users', [201, { id: 2, name: 'Jane Smith' }]],
])

// ✅ Use the mock fetch
const response = await fetch("/users")
const data = await response.json()
console.log(data) // { id: 1, name: 'John Doe' }

// ✅ Create a mock DB
const db = new MemoryDB({
	predefined: [
		['file1.txt', 'content1'],
		['file2.txt', 'content2'],
	]
})

// ✅ Use the mock DB
await db.connect()
const content = await db.loadDocument('file1.txt')
console.log(content) // 'content1'
```
## API

### `mockFetch(routes)`
Creates a mock fetch function based on the provided routes.

* **Parameters**
  * `routes` – Route patterns with their corresponding responses.

* **Returns**
  * `function` – An async function that mimics the fetch API.

#### Route Patterns
* `exact match` – matches the exact route.
* `method wildcard` – matches any method with the specified path.
* `path wildcard` – matches the specified method with any path starting with the given prefix.
* `catch all` – matches any route.

### `MemoryDB(options)`
MemoryDB class for testing as mock DB.

* **Parameters**
  * `options` – Options for the MemoryDB instance.

### `DocsParser()`
Extracts documentation from test files.

## Testing

Run the bundled tests with:
```bash
npm test
```
The test suite covers default behaviour, placeholder substitution and fallback
logic.

## Contributing

Ready to contribute [check here](./CONTRIBUTING.md)

## License

ISC – see the [LICENSE](./LICENSE) file.
