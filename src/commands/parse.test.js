import { describe, it, todo } from "node:test"
import { strict as assert, fail } from "node:assert"
import DBFS from "@nan0web/db-fs"

import ParseCommand, { ParseCommandMessage } from "./parse.js"

const fs = new DBFS({ root: "src/commands" })

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

	it("should filter only fail messages", async () => {
		class TestParseCommand extends ParseCommand {
			async readInput() {
				return await fs.loadDocument("parse.test.context.txt", "")
			}
		}
		const cmd = new TestParseCommand()
		const msg1 = new ParseCommandMessage({ opts: { fail: true } })
		const r1 = await cmd.run(msg1)
		assert.ok(r1.includes("\n✖ failing tests:"))
		assert.equal(r1.trim().split("\n").length, 9)

		const msg2 = new ParseCommandMessage({ opts: { fail: true, todo: true } })
		const r2 = await cmd.run(msg2)
		assert.equal(r2.includes("should calculate relative paths"), true)
		assert.equal(r2.trim().split("\n").length, 29)
	})
})
