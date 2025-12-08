import { describe, it } from "node:test"
import assert from "node:assert"
import { mockFetch } from "@nan0web/http-node/test"

describe("mockFetch", () => {
	it("Support exact route matching, wildcards and catch-all patterns", async () => {
		const fetch = mockFetch([
			['GET /exact', { exact: true }],
			['* /wildcard', { method: 'wildcard' }],
			['GET /path/*', { path: 'wildcard' }],
			['* *', { catch: 'all' }]
		])

		// Exact match
		let response = await fetch('/exact', { method: 'GET' })
		let data = await response.json()
		assert.deepStrictEqual(data, { exact: true })

		// Method wildcard
		response = await fetch('/wildcard', { method: 'POST' })
		data = await response.json()
		assert.deepStrictEqual(data, { method: 'wildcard' })

		// Path wildcard
		response = await fetch('/path/subpath', { method: 'GET' })
		data = await response.json()
		assert.deepStrictEqual(data, { path: 'wildcard' })

		// Catch all
		response = await fetch('/anything', { method: 'DELETE' })
		data = await response.json()
		assert.deepStrictEqual(data, { catch: 'all' })
	})

	it("Handle various HTTP methods and status codes", async () => {
		const fetch = mockFetch([
			['POST /create', [201, { created: true }]],
			['DELETE /remove', [204, {}]],
			['PUT /update', [200, { updated: true }]]
		])

		let response = await fetch('/create', { method: 'POST' })
		assert.strictEqual(response.status, 201)
		assert.ok(response.ok)

		response = await fetch('/remove', { method: 'DELETE' })
		assert.strictEqual(response.status, 204)
		assert.ok(response.ok)

		response = await fetch('/update', { method: 'PUT' })
		assert.strictEqual(response.status, 200)
		assert.ok(response.ok)
	})

	it("Return proper Response objects with json/text methods", async () => {
		const fetch = mockFetch([
			['GET /json', { data: 'json' }],
			['GET /text', 'plain text']
		])

		let response = await fetch('/json')
		assert.ok(typeof response.json === 'function')
		const jsonData = await response.json()
		assert.deepStrictEqual(jsonData, { data: 'json' })

		response = await fetch('/text')
		assert.ok(typeof response.text === 'function')
		// Note: our mock doesn't implement text() but real fetch does
	})

	it("Function-based responses for dynamic mock data", async () => {
		const fetch = mockFetch([
			['GET /dynamic', async (method, url) => ({ method, url })]
		])

		const response = await fetch('/dynamic', { method: 'GET' })
		const data = await response.json()

		assert.deepStrictEqual(data, { method: 'GET', url: '/dynamic' })
	})

	it("Support for custom HTTP status codes", async () => {
		const fetch = mockFetch([
			['GET /custom', [418, { message: 'I am a teapot' }]]
		])

		const response = await fetch('/custom')
		assert.strictEqual(response.status, 418)
		assert.strictEqual(response.ok, false)

		const data = await response.json()
		assert.deepStrictEqual(data, { message: 'I am a teapot' })
	})

	it("Automatic 404 handling for unmatched routes", async () => {
		const fetch = mockFetch([])

		const response = await fetch('/nonexistent')
		assert.strictEqual(response.status, 404)
		assert.strictEqual(response.ok, false)

		const data = await response.json()
		assert.deepStrictEqual(data, { error: 'Not found' })
	})
})
