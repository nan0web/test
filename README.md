# @nan0web/test

A test package with simple utilities for testing in node.js runtime.

|Package name|[Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Documentation|Test coverage|Features|Npm version|
|---|---|---|---|---|---|
 |[@nan0web/test](https://github.com/yaro-rasta/nan0test/) |🟡 `81.7%` |🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/yaro-rasta/nan0test/blob/main/README.md) |🟢 `98.0%` |📜 system.md |— |

## Installation

How to install with npm?
```bash
npm install @nan0web/test
```

How to install with pnpm?
```bash
pnpm add @nan0web/test
```

How to install with yarn?
```bash
yarn add @nan0web/test
```

## API

### `mockFetch(routes)`

Creates a mock fetch function based on the provided routes.

* **Parameters**
  * `routes` – Route patterns with their corresponding responses.

* **Returns**
  * `function` – An async function that mimics the fetch API.

#### Route Patterns

- `exact match` – matches the exact route.
- `method wildcard` – matches any method with the specified path.
- `path wildcard` – matches the specified method with any path starting with the given prefix.
- `catch all` – matches any route.

How to use mockFetch to make laconic tests for fetch() function?
```js
import { mockFetch } from '@nan0web/test'

// ✅ Create a mock fetch function
const fetch = mockFetch([
	['GET /users', { id: 1, name: 'John Doe' }],
	['POST /users', [201, { id: 2, name: 'Jane Smith' }]],
])

// ✅ Use the mock fetch
const response = await fetch("/users")
const data = await response.json()
console.log(data) // { id: 1, name: 'John Doe' }
```
### `MemoryDB(options)`

MemoryDB class for testing as mock DB.

* **Parameters**
  * `options` – Options for the MemoryDB instance.

How to use MemoryDB to imitate any of DB (nan0web/db) extensions?
```js
import { MemoryDB } from '@nan0web/test'
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
### `runSpawn(cmd, args, opts)`

Executes a command in a child process and collects its output.

* **Parameters**
  * `cmd` – The command to execute.
  * `args` – Optional. Command-line arguments. Default is empty array.
  * `opts` – Optional. Process spawning options. Includes optional onData handler. Default is empty object.

* **Returns**
  * `{ code: number; text: string }` – Exit code and concatenated stdout output.

How to use runSpawn as a short version of node spawn?
```js
import { runSpawn } from "@nan0web/test"
const { code, text } = await runSpawn('echo', ['hello world']) // ← { code: 0, text: "hello world" }
```
### `DocsParser()`

Extracts documentation from test files as a provendoc where every example of code covered with a test.
Such tests are useful for datasets generation for LLM fine-tune on specific application or platform source code.

How to use DocsParser to extract and generate proven documentation in markdown format?
```js
import { describe, it, before } from 'node:test'
import { DocsParser } from "@nan0web/test"
import assert from 'node:assert'
import FS from "@nan0web/db-fs"
const fs = new FS()
let pkg = {}
/**
 * Defining a function to use it for describe() and for provendoc generation
 */
const testRender = () => {
	before(async () => {
		pkg = await fs.loadDocument("package.json", pkg)
	})
	/**
	 * @docs
	 * # my-package-name
	 *
	 * My package description.
	 *
	 * This document is available in other languages:
	 * - [Ukrainian 🇺🇦](./docs/uk/README.md)
	 */
	it("## Install", () => {
		/**
		 * ```bash
		 * npm install my-package-name
		 * ```
		 */
		assert.equal(pkg.name, "my-package-name")
	})
}
describe('README.md testing', testRender)
describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("my-package-name"))
	})
})
```

## Testing

The test suite covers default behaviour, placeholder substitution and fallback
logic.

How to run tests of cloned package with npm?
```bash
npm test
```

How to run tests of cloned package with pnpm?
```bash
pnpm test
```

How to run tests of cloned package with yarn?
```bash
yarn test
```

## Contributing

How to contribute? — check here [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

How to license your product with this package? – see the [LICENSE](./LICENSE) file.
