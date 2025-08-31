import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'

/**
 * @docs
 * ## jsdom
 *
 * Global jsdom setup for node:test environment
 *
 * Creates browser-like DOM environment with localStorage mock.
 * Automatically called on import.
 */
describe('jsdom', () => {
	/** @type {string} */
	let originalDocument
	/** @type {string} */
	let originalWindow

	beforeEach(() => {
		originalDocument = globalThis.document
		originalWindow = globalThis.window
		delete globalThis.document
		delete globalThis.window
	})

	it("should setup DOM environment and localStorage mock", async () => {
		// ✅ Import module to setup DOM
		await import('./jsdom.js')

		// ✅ Verify globals are set
		assert.ok(globalThis.document)
		assert.ok(globalThis.window)
		assert.ok(globalThis.Element)
		assert.ok(globalThis.HTMLElement)
		assert.ok(globalThis.customElements)
		assert.ok(globalThis.localStorage)

		// ✅ Verify localStorage mock works
		globalThis.localStorage.setItem('test', 'value')
		assert.strictEqual(globalThis.localStorage.getItem('test'), 'value')
		assert.strictEqual(globalThis.localStorage.length, 1)

		globalThis.localStorage.removeItem('test')
		assert.strictEqual(globalThis.localStorage.getItem('test'), null)
		assert.strictEqual(globalThis.localStorage.length, 0)

		globalThis.localStorage.setItem('test1', 'value1')
		globalThis.localStorage.setItem('test2', 'value2')
		assert.strictEqual(globalThis.localStorage.key(0), 'test1')
		assert.strictEqual(globalThis.localStorage.key(1), 'test2')
		assert.strictEqual(globalThis.localStorage.length, 2)

		globalThis.localStorage.clear()
		assert.strictEqual(globalThis.localStorage.length, 0)
	})

	it("should not override existing DOM globals", async () => {
		// ✅ Set mock globals
		globalThis.document = { mock: "document" }
		globalThis.window = { mock: "window" }

		// ✅ Import module
		await import('./jsdom.js')

		// ✅ Verify mock globals are preserved
		assert.deepStrictEqual(globalThis.document, { mock: "document" })
		assert.deepStrictEqual(globalThis.window, { mock: "window" })
	})
})