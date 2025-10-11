import { describe, it } from "node:test"
import { strict as assert } from "node:assert"

import { StatusCommandMessage } from "./status.js"

describe("StatusCommand", () => {

	it("should parse StatusCommandMessage with default options", () => {
		const msg = new StatusCommandMessage({})
		assert.equal(msg.opts.help, false)
		assert.equal(msg.opts.hide_name, false)
		assert.equal(msg.opts.hide_status, false)
		assert.equal(msg.opts.hide_docs, false)
		assert.equal(msg.opts.hide_coverage, false)
		assert.equal(msg.opts.hide_features, false)
		assert.equal(msg.opts.hide_npm, false)
		assert.equal(msg.opts.todo, false)
		assert.equal(msg.opts.format, "txt")
	})

	it("should map alias options correctly", () => {
		const msg = new StatusCommandMessage({ opts: { "hide-name": true, "hide-status": true } })
		assert.equal(msg.opts.hide_name, true)
		assert.equal(msg.opts.hide_status, true)
	})

	it("should accept format option and validate it", () => {
		const msg = new StatusCommandMessage({ opts: { format: "md" } })
		assert.equal(msg.opts.format, "md")
	})

	it("should reject invalid format option", () => {
		assert.throws(() => {
			new StatusCommandMessage({ opts: { format: "invalid" } })
		}, /Error/)
	})

})
