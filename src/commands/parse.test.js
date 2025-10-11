import { describe, it } from "node:test"
import { strict as assert } from "node:assert"

import { ParseCommandMessage } from "./parse.js"

describe("ParseCommand", () => {
	it("should parse ParseCommandMessage with default options", () => {
		const msg = new ParseCommandMessage({})
		assert.equal(msg.opts.help, false)
		assert.equal(msg.opts.fail, false)
		assert.equal(msg.opts.skip, false)
		assert.equal(msg.opts.todo, false)
		assert.equal(msg.opts.format, "txt")
	})

	it("should map alias options correctly", () => {
		const msg = new ParseCommandMessage({ opts: { f: true, s: true, d: true } })
		assert.equal(msg.opts.fail, true)
		assert.equal(msg.opts.skip, true)
		assert.equal(msg.opts.todo, true)
	})

	it("should accept format option and validate it", () => {
		const msg = new ParseCommandMessage({ opts: { format: "md" } })
		assert.equal(msg.opts.format, "md")
	})

	it.todo("should reject invalid format option", () => {
		assert.throws(() => {
			new ParseCommandMessage({ opts: { format: "invalid" } })
		}, /Error/)
	})
})
