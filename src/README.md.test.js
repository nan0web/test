import { describe, it, after, before, beforeEach } from 'node:test'
import assert from 'node:assert'
import FS from "@nan0web/db-fs"
import { NoConsole } from '@nan0web/log'
import DocsParser from './Parser/DocsParser.js'
import MemoryDB from './mock/MemoryDB.js'
import mockFetch from './mock/fetch.js'

const fs = new FS()
let pkg = {}
const originalConsole = console

/**
 * Core test suite that also serves as the source for README generation.
*/
function testRender() {
	before(async () => {
		pkg = await fs.loadDocument("package.json", pkg)
	})
	beforeEach(() => {
		console = new NoConsole()
	})
	after(() => {
		console = originalConsole
	})
	/**
	 * @docs
	 * # @nan0web/test
	 *
	 * A test package with simple utilities for testing in node.js runtime.
	 *
	 * ## Install
	 * ```bash
	 * npm install @nan0web/test
	 * ```
	 *
	 * ## Usage
	 */
	it("Example usage of mockFetch and MemoryDB", async () => {
		//import { mockFetch, MemoryDB } from '@nan0web/test'

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
		assert.deepStrictEqual(console.output(), [
			["log", { id: 1, name: 'John Doe' }],
			["log", 'content1']
		])
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### `mockFetch(routes)`
	 * Creates a mock fetch function based on the provided routes.
	 *
	 * * **Parameters**
	 *   * `routes` – Route patterns with their corresponding responses.
	 *
	 * * **Returns**
	 *   * `function` – An async function that mimics the fetch API.
	 *
	 * #### Route Patterns
	 * * `exact match` – matches the exact route.
	 * * `method wildcard` – matches any method with the specified path.
	 * * `path wildcard` – matches the specified method with any path starting with the given prefix.
	 * * `catch all` – matches any route.
	 *
	 * ### `MemoryDB(options)`
	 * MemoryDB class for testing as mock DB.
	 *
	 * * **Parameters**
	 *   * `options` – Options for the MemoryDB instance.
	 *
	 * ### `DocsParser()`
	 * Extracts documentation from test files.
	 *
	 * ## Testing
	 */
	it("Run the bundled tests with:", () => {
		/**
		 * ```bash
		 * npm test
		 * ```
		 * The test suite covers default behaviour, placeholder substitution and fallback
		 * logic.
		 */
		assert.ok(String(pkg.scripts?.test).startsWith("node --test"))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('Ready to contribute [check here](./CONTRIBUTING.md)', async () => {
		/** @docs */
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('ISC – see the [LICENSE](./LICENSE) file.', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md', testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})
