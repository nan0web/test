import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert'
import FS from "@nan0web/db-fs"
import { NoConsole } from '@nan0web/log'
import DocsParser from './Parser/DocsParser.js'
import DatasetParser from "./Parser/DatasetParser.js"
import MemoryDB from './mock/MemoryDB.js'
import mockFetch from './mock/fetch.js'
import runSpawn from './exec/runSpawn.js'

const fs = new FS()
let pkg = {}
let console = new NoConsole()

const preload = async () => {
	pkg = await fs.loadDocument("package.json", pkg)
}

/**
 * Core test suite that also serves as the source for README generation.
 */
function testRender() {
	before(preload)
	beforeEach(() => {
		console = new NoConsole()
	})
	/**
	 * @docs
	 * # @nan0web/test
	 *
	 * A test package with simple utilities for testing in node.js runtime.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/test
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/test")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/test
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/test")
	})
	/**
	 * @docs
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/test
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/test")
	})
	/**
	 * @docs
	 * ## API
	 *
	 * ### `mockFetch(routes)`
	 *
	 * Creates a mock fetch function based on the provided routes.
	 *
	 * * **Parameters**
	 *   * `routes` – Route patterns with their corresponding responses.
	 *
	 * * **Returns**
	 *   * `function` – An async function that mimics the fetch API.
	 *
	 * #### Route Patterns
	 *
	 * - `exact match` – matches the exact route.
	 * - `method wildcard` – matches any method with the specified path.
	 * - `path wildcard` – matches the specified method with any path starting with the given prefix.
	 * - `catch all` – matches any route.
	 *
	 */
	it("How to use mockFetch to make laconic tests for fetch() function?", async () => {
		//import { mockFetch } from '@nan0web/test'

		// ✅ Create a mock fetch function
		const fetch = mockFetch([
			['GET /users', { id: 1, name: 'John Doe' }],
			['POST /users', [201, { id: 2, name: 'Jane Smith' }]],
		])

		// ✅ Use the mock fetch
		const response = await fetch("/users")
		const data = await response.json()
		console.log(data) // { id: 1, name: 'John Doe' }
		assert.deepStrictEqual(console.output(), [
			["log", { id: 1, name: 'John Doe' }],
		])
	})
	/**
	 * @docs
	 * ### `MemoryDB(options)`
	 *
	 * MemoryDB class for testing as mock DB.
	 *
	 * * **Parameters**
	 *   * `options` – Options for the MemoryDB instance.
	 *
	 */
	it("How to use MemoryDB to imitate any of DB (nan0web/db) extensions?", async () => {
		//import { MemoryDB } from '@nan0web/test'
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
			["log", 'content1']
		])
	})

	/**
	 * @docs
	 * ### `runSpawn(cmd, args, opts)`
	 *
	 * Executes a command in a child process and collects its output.
	 *
	 * * **Parameters**
	 *   * `cmd` – The command to execute.
	 *   * `args` – Optional. Command-line arguments. Default is empty array.
	 *   * `opts` – Optional. Process spawning options. Includes optional onData handler. Default is empty object.
	 *
	 * * **Returns**
	 *   * `{ code: number; text: string }` – Exit code and concatenated stdout output.
	 *
	 */
	it("How to use runSpawn as a short version of node spawn?", async () => {
		//import { runSpawn } from "@nan0web/test"
		const { code, text } = await runSpawn('echo', ['hello world']) // ← { code: 0, text: "hello world" }
		assert.strictEqual(code, 0)
		assert.ok(text.includes('hello world'))
	})
	/**
	 * @docs
	 * ### `DocsParser()`
	 *
	 * Extracts documentation from test files as a provendoc where every example of code covered with a test.
	 * Such tests are useful for datasets generation for LLM fine-tune on specific application or platform source code.
	 *
	 */
	it("How to use DocsParser to extract and generate proven documentation in markdown format?", () => {
		/**
		 * @docs raw
		import { describe, it, before } from 'node:test'
		import { DocsParser } from "@nan0web/test"
		import assert from 'node:assert'
		import FS from "@nan0web/db-fs"
		const fs = new FS()
		let pkg = {}
		/**
		 * Defining a function to use it for describe() and for provendoc generation
		 *\/
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
			 *\/
			it("## Install", () => {
				/**
				 * ```bash
				 * npm install my-package-name
				 * ```
				 *\/
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
		*/
		assert.ok(true)
	})

	/**
	 * @docs
	 *
	 * ## Testing
	 *
	 * The test suite covers default behaviour, placeholder substitution and fallback
	 * logic.
	 */
	it("How to run tests of cloned package with npm?", () => {
		/**
		 * ```bash
		 * npm test
		 * ```
		 */
		assert.ok(String(pkg.scripts?.test).startsWith("node --test"))
	})
	/**
	 * @docs
	 */
	it("How to run tests of cloned package with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm test
		 * ```
		 */
		assert.ok(String(pkg.scripts?.test).startsWith("node --test"))
	})
	/**
	 * @docs
	 */
	it("How to run tests of cloned package with yarn?", () => {
		/**
		 * ```bash
		 * yarn test
		 * ```
		 */
		assert.ok(String(pkg.scripts?.test).startsWith("node --test"))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? — check here [CONTRIBUTING.md](./CONTRIBUTING.md)', async () => {
		/** @docs */
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license your product with this package? – see the [LICENSE](./LICENSE) file.', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md', testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	before(async () => {
		await preload()
		const parser = new DocsParser()
		text = String(parser.decode(testRender))
		await fs.saveDocument("README.md", text)
		const dataset = DatasetParser.parse(text, pkg.name)
		await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)
	})
	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})
