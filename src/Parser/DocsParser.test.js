import { before, describe, it } from "node:test"
import assert from "node:assert"
import FS from "@nan0web/db-fs"
import DocsParser from "./DocsParser.js"

const fs = new FS()

/**
 * Core test suite that also serves as the source for README generation.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/i18n
	 *
	 * A tiny, zero‑dependency i18n helper for Java•Script projects.
	 * It provides a default English dictionary and a simple `createT` factory to
	 * generate translation functions for any language.
	 *
	 * ## Installation
	 */
	it("How to install package @nan0web/i18n with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/i18n
		 * ```
		 */
		assert.ok(true, "Checked the package name")
	})
	/**
	 * @docs
	 */
	it("How to install package @nan0web/i18n with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/i18n
		 * ```
		 */
		assert.ok(true, "Checked the package name")
	})
	/**
	 * @docs
	 */
	it("How to install package @nan0web/i18n with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/i18n
		 * ```
		 */
		assert.ok(true, "Checked the package name")
	})
	/**
	 * @docs
	 *
	 * ## Usage
	 */
	it("tDefault is just for example, usually there is no need to use it", () => {
		//import tDefault, { createT } from '@nan0web/i18n'
		//import uk from './src/uk.js'   // Ukrainian dictionary

		// ✅ Default (English) translation function
		console.info(tDefault('Welcome!', { name: 'Anna' }))
		// → "Welcome, Anna!"

		// ✅ Create a Ukrainian translation function
		const t = createT(uk)

		console.info(t('Welcome!', { name: 'Іван' }))
		// → "Вітаємо у пісочниці, Іван!"

		// ✅ Missing key falls back to the original key
		console.info(t('NonExistingKey'))
		// → "NonExistingKey"
		assert.deepStrictEqual(console.output(), [
			"Welcome, Anna!", "Вітаємо у пісочниці, Іван!", "NonExistingKey"
		].map(el => (["info", el])))
	})
	/**
	 * @docs
	 *
	 * ## API
	 *
	 * ### `createT(vocab)`
	 *
	 * Creates a translation function bound to the supplied vocabulary.
	 *
	 * * **Parameters**
	 *   * `vocab` – an object mapping English keys to localized strings.
	 *
	 * * **Returns**
	 *   * `function t(key, vars?)` – a translation function.
	 *
	 * #### Translation function `t(key, vars?)`
	 *
	 * * **Parameters**
	 *   * `key` – the original English string.
	 *   * `vars` – (optional) an object with placeholder values, e.g. `{ name: 'John' }`.
	 * * **Behaviour**
	 *   * Looks up `key` in the provided vocabulary.
	 *   * If the key is missing, returns the original `key`.
	 *   * Replaces placeholders of the form `{placeholder}` with values from `vars`.
	 *
	 * ### Default export
	 *
	 * The default export is a translation function that uses the built‑in English
	 * dictionary (`defaultVocab`). It is ready to use without any setup.
	 *
	 * ## Adding a New Language
	 *
	 * Create a new module (e.g., `src/fr.js`) that exports a dictionary:
	 *
	 * ```js
	 * export default {
	 *   "Welcome!": "Bienvenue, {name}!",
	 *   "Submit": "Envoyer",
	 *   // …other keys
	 * }
	 * ```
	 * Then generate a translation function:
	 *
	 * ```js
	 * import fr from './src/fr.js'
	 * const t = createT(fr)
	 * ```
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
	 *
	 * ## Contributing
	 */
	it("Ready to contribute [check here](./CONTRIBUTING.md)", async () => {
		/**
		 * Let's add some docs inside the block
		 */
		/** @docs */
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})
	/**
	 * @docs
	 *
	 * ## License
	 */
	it('ISC – see the [LICENSE](./LICENSE) file.', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
	/**
	 * @docs
	 *
	 * ## PS.:
	 */
	it("How to parse raw docs?", () => {
		/**
		 * @docs raw
		import { DocsParser } from "@nan0web/test"
		const parser = new DocsParser()
		/**
		 * @docs
		 * Check the markdown format
		 *\/
		const node = parser.decode(() => {})
		String(node) // ← Markdown document
		*/
		assert.ok(true)
	})

	it('package.json scripts contain required commands', () => {
		const scripts = pkg.scripts || {}
		assert.ok(scripts.build, 'Missing "build" script')
		assert.ok(scripts.test, 'Missing "test" script')
		// pre-commit can be defined as "pre-commit" or as a husky hook; we check both keys
		assert.ok(
			scripts['pre-commit'] || scripts.precommit,
			'Missing "pre-commit" script'
		)
	})
}

describe("DocsParser", () => {
	let md = ""
	before(async () => {
		md = String(await fs.loadDocument("src/Parser/DocsParser.test.md"))
	})
	it("should parse a function", async () => {
		const parser = new DocsParser()
		const node = parser.decode(testRender)
		await fs.saveDocument("dist/docs/parse-function.node.md", String(node) + "\n")
		await fs.saveDocument("dist/docs/parse-function.orig.md", md)
		assert.ok(node)
		assert.equal(String(node) + "\n", md)
	})
})
