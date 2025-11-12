import { describe, it } from "node:test"
import { strict as assert } from "node:assert"

import StatusCommand, { Status } from "./status.js"

describe("StatusCommand", () => {

	it("should parse Status with default options", () => {
		const msg = new Status({})
		assert.equal(msg.body.help, false)
		assert.equal(msg.body.hide_name, false)
		assert.equal(msg.body.hide_status, false)
		assert.equal(msg.body.hide_docs, false)
		assert.equal(msg.body.hide_coverage, false)
		assert.equal(msg.body.hide_features, false)
		assert.equal(msg.body.hide_npm, false)
		assert.equal(msg.body.todo, false)
		assert.equal(msg.body.format, "txt")
	})

	it("should map alias options correctly", () => {
		const msg = new Status({ body: { "hide-name": true, "hide-status": true } })
		assert.equal(msg.body.hide_name, true)
		assert.equal(msg.body.hide_status, true)
	})

	it("should accept format option and validate it", () => {
		const msg = new Status({ body: { format: "md" } })
		assert.equal(msg.body.format, "md")
	})

	it("should reject invalid format option", () => {
		assert.throws(() => {
			new Status({ body: { format: "invalid" } })
		}, /Error/)
	})

})
