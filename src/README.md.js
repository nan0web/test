import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db-fs'
import { NoConsole } from "@nan0web/log"
import { DocsParser, DatasetParser } from "@nan0web/test"
import {
	MemoryDB,
	TestPackage,
	RRS,
	runSpawn,
} from './index.js'

const fs = new DB()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/test
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * A test package with simple utilities for testing in node.js runtime.
	 * Designed for [nan0web philosophy](https://github.com/nan0web/monorepo/blob/main/system.md#%D0%BD%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%BD%D1%8F-%D1%81%D1%86%D0%B5%D0%BD%D0%B0%D1%80%D1%96%D1%97%D0%B2),
	 * where zero dependencies mean maximum freedom and minimal assumptions.
	 *
	 * This package helps build ProvenDocs and structured datasets from test examples,
	 * especially useful for LLM fine-tuning.
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
	 * ## Core Concepts
	 *
	 * This package is designed with zero external dependencies and maximum clarity:
	 * - ✅ Fully typed with **JSDoc** and `.d.ts` files
	 * - 🔁 Includes mocked utilities for real testing scenarios
	 * - 🧠 Built for cognitive clarity: each function has a clear purpose
	 * - 🌱 Enables lightweight testing without side effects
	 *
	 * ### `MemoryDB(options)`
	 * Utility to simulate a file system for tests.
	 *
	 * * **Parameters**
	 *   * `options` – Object of params including:
	 *     - `predefined` – Map of pre-defined file contents (e.g., `{ 'users.json': '[{ id: 1 }]' }`)
	 */
	it("How to mock file system using MemoryDB?", async () => {
		//import { MemoryDB } from "@nan0web/test"

		const db = new MemoryDB({
			predefined: new Map([
				['file1.txt', 'content1'],
				['file2.txt', 'content2'],
			]),
		})

		await db.connect()
		const content = await db.loadDocument('file1.txt')

		console.info(content) // 'content1'
		assert.deepStrictEqual(console.output(), [
			["info", 'content1'],
		])
	})

	/**
	 * @docs
	 * ### `runSpawn(cmd, args, options)`
	 * Utility to mock and execute child processes (for CLI tools).
	 *
	 * * **Parameters**
	 *   * `cmd` – command to run (e.g., `"git"`)
	 *   * `args` – array of arguments
	 *   * `opts` – optional spawn options with `onData` handler
	 *
	 * * **Returns**
	 *   * `{ code: number, text: string }`
	 */
	it("How to use runSpawn as a CLI test tool?", async () => {
		//import { runSpawn } from "@nan0web/test"

		const { code, text } = await runSpawn('echo', ['hello world'])

		console.info(code) // 0
		console.info(text.includes('hello world')) // true

		assert.deepStrictEqual(console.output(), [
			["info", 0],
			["info", true],
		])
	})

	/**
	 * @docs
	 * ### `TestPackage(options)`
	 * Class to automate package verification based on nan0web standards.
	 *
	 * * **Parameters**
	 *   * `options` – package metadata and file system db instance
	 */
	it("How to validate a package using TestPackage.run(rrs)?", async () => {
		//import { TestPackage, RRS } from "@nan0web/test"
		const db = new MemoryDB()

		db.set("system.md", "# system.md")
		db.set("tsconfig.json", "{}")
		db.set("README.md", "# README.md")
		db.set("LICENSE", "ISC")

		const pkg = new TestPackage({
			db,
			cwd: ".",
			name: "@nan0web/test",
			baseURL: "https://github.com/nan0web/test"
		})

		const rrs = new RRS()
		const statuses = []

		for await (const s of pkg.run(rrs)) {
			statuses.push(s.name + ':' + s.value)
		}

		console.info(statuses.join('\n'))
		assert.ok(statuses.includes('load system.md: 🟢'))
	})

	/**
	 * @docs
	 * ### `DocsParser`
	 * Parser to extract documentation from tests and generate markdown (ProvenDoc).
	 *
	 * It reads js tests with comments like:
	 * ```js
	 * it("How to do something?", () => {
	 *   ...
	 * })
	 * ```
	 * and converts them into structured `.md` documents.
	 */
	it("How to generate documentation using DocsParser?", async () => {
		//import { DocsParser } from "@nan0web/test"

		const parser = new DocsParser()
		const md = parser.decode(() => {
			/**
			 * @docs
			 * # Title
			 * Content
			 */
			it('How to do X?', () => {
				/**
				 * ```js
				 * doX()
				 * ```
				 */
				assert.ok(true)
			})
		})

		console.info(md) // ← markdown with content from @docs
		assert.ok(String(console.output()[0][1]).includes('# Title'))
	})

	/**
	 * @docs
	 * ### `DatasetParser`
	 * Parser that converts markdown docs (such as README.md) into structured `.jsonl` datasets.
	 *
	 * Each How-to block becomes one test case:
	 * ```json
	 * {"instruction": "How to do X?", "output": "```js\n doX()\n```", ...}
	 * ```
	 */
	it("How to generate dataset from markdown documentation?", () => {
		//import { DatasetParser } from "@nan0web/test"
		const md = '# Title\n\nHow to do X?\n```js\ndoX()\n```'
		const dataset = DatasetParser.parse(md, '@nan0web/test')

		console.info(dataset[0].instruction) // ← "How to do X?"
		assert.deepStrictEqual(console.output()[0][1], "How to do X?")
	})

	/**
	 * @docs
	 * ## Playground
	 *
	 * This package doesn't use heavy mocking or virtual environments — it simulates them with lightweight wrappers.
	 * You can play in its sandbox as follows:
	 */
	it("How to run CLI sandbox?", () => {
		/**
		 * ```bash
		 * git clone https://github.com/nan0web/test.git
		 * cd test
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play).includes("node play"))
	})

	/**
	 * @docs
	 * ## API Components
	 */
	it("has multiple test components that can be imported separately", () => {
		//import { MemoryDB, DocsParser, DatasetParser, runSpawn } from "@nan0web/test"

		assert.ok(MemoryDB.prototype.constructor)
		assert.ok(DocsParser.prototype.decode)
		assert.ok(DatasetParser.parse)
		assert.ok(typeof runSpawn === 'function')
	})

	/**
	 * @docs
	 * ## Java•Script types & Autocomplete
	 * Package is fully typed with jsdoc and d.ts.
	 */
	it("How many d.ts files should cover the source?", () => {
		assert.equal(pkg.types, "types/index.d.ts")
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? - [check here]($pkgURL/blob/main/CONTRIBUTING.md)", async () => {
		/** @docs */
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it("How to license? - [LICENSE]($pkgURL/blob/main/LICENSE)", async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format

	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)

	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})
