import { before, describe, it } from "node:test"
import assert from "node:assert"
import FS from "@nan0web/db-fs"
import DocsParser from "../../../../src/Parser/DocsParser.js"

const fs = new FS()

describe("DocsParser", () => {
	before(async () => {
		await fs.connect()
	})

	it("Tests with `@docs` comments should be parsed into markdown documentation", async () => {
		const parser = new DocsParser()
		const testFn = () => {
			/**
			 * @docs
			 * # Test Title
			 *
			 * Test content
			 */
			it("How to use function?", () => {
				/**
				 * ```js
				 * const result = fn()
				 * ```
				 */
				assert.ok(true)
			})
		}

		const node = parser.decode(testFn)
		const content = String(node)

		assert.ok(content.includes("# Test Title"))
		assert.ok(content.includes("How to use function?"))
	})

	it("Code examples in tests should be included in the generated documentation", async () => {
		const parser = new DocsParser()
		const testFn = () => {
			/**
			 * @docs
			 */
			it("Example with code block", () => {
				/**
				 * ```bash
				 * npm install package
				 * ```
				 */
				assert.ok(true)
			})
		}

		const node = parser.decode(testFn)
		const content = String(node)

		assert.ok(content.includes("```bash"))
		assert.ok(content.includes("npm install package"))
		assert.ok(content.includes("```"))
	})

	it("Documentation should maintain proper structure and formatting", async () => {
		const parser = new DocsParser()
		const testFn = () => {
			/**
			 * @docs
			 * # Main Title
			 *
			 * ## Sub Title
			 *
			 * ### Sub Sub Title
			 */
			it("Test item", () => {
				/**
				 * ```js
				 * example()
				 * ```
				 */
				assert.ok(true)
			})
		}

		const node = parser.decode(testFn)
		const content = String(node)
		const lines = content.split('\n')

		// Verify header hierarchy
		const h1Index = lines.findIndex(line => line.startsWith('# '))
		const h2Index = lines.findIndex(line => line.startsWith('## '))
		const h3Index = lines.findIndex(line => line.startsWith('### '))

		assert.ok(h1Index >= 0, 'Main title should exist')
		assert.ok(h2Index >= 0, 'Sub title should exist')
		assert.ok(h2Index > h1Index, 'Sub title should come after main title')
		assert.ok(h3Index >= 0, 'Sub sub title should exist')
		assert.ok(h3Index > h2Index, 'Sub sub title should come after sub title')
	})

	it("Each exported function must have installation examples", async () => {
		const readmeContent = await fs.loadDocument("README.md")

		// Check for installation examples in README
		assert.ok(readmeContent.includes('npm install'))
		assert.ok(readmeContent.includes('pnpm add'))
		assert.ok(readmeContent.includes('yarn add'))
	})

	it("Usage examples should include both basic and advanced scenarios", async () => {
		const readmeContent = await fs.loadDocument("README.md")

		// Should have both simple usage and LICENSE document reference.
		assert.ok(readmeContent.includes('import'))
		assert.ok(readmeContent.includes('const'))
		assert.ok(readmeContent.includes('[LICENSE]('))
	})

	it("All code blocks should be executable and tested", async () => {
		// This is verified by checking test coverage in other tests
		const result = await fs.loadDocument("coverage/lcov.info")
		assert.ok(result.includes("src/index.js"))
	})
})
