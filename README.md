# @nan0web/test

A lightweight utility to mock the `fetch` API for testing purposes. Useful in both Node.js and browser environments.

## Installation

Using pnpm:

```bash
pnpm add @nan0web/test
```

## Usage

```js
import mockFetch from '@nan0web/test'

const routes = [
  ['GET /users', { id: 1, name: 'John Doe' }],
  ['POST /users', [201, { id: 2, name: 'Jane Smith' }]],
  ['GET /items/*', (method, url) => ({ path: url, method })],
]

const fetch = mockFetch(routes)

const response = await fetch('/users')
const data = await response.json()
// data => { id: 1, name: 'John Doe' }
```

### Route Patterns

- Exact match: `GET /users`
- Method wildcard: `* /users`
- Path wildcard: `GET /users/*`
- Path directory: `GET /users/`
- Match all get: `GET /`
- Match all get: `GET *`
- Match all: `* *`, or `* /`, or `*`

The response can either be:
- An object that will be returned as JSON with status 200
- An array with two items: status code and response data
- A function that returns either:
  - A resolved object or Promise
  - An object with an `ok`, `status`, and `data` property

## Contributing

You are welcome to contribute, details in [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

[ISC](./LICENSE)
