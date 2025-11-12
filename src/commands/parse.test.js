import { describe, it } from "node:test"
import { strict as assert } from "node:assert"
import DBFS from "@nan0web/db-fs"

import ParseCommand, { ParseMessage } from "./parse.js"

const fs = new DBFS({ root: "src/commands" })

describe("ParseCommand", () => {
	it("should parse ParseMessage with default options", () => {
		const msg = new ParseMessage({})
		assert.equal(msg.body.help, false)
		assert.equal(msg.body.fail, false)
		assert.equal(msg.body.skip, false)
		assert.equal(msg.body.todo, false)
		assert.equal(msg.body.format, "txt")
	})

	it("should map alias options correctly", () => {
		const msg = new ParseMessage({ body: { f: true, s: true, d: true } })
		assert.equal(msg.body.fail, true)
		assert.equal(msg.body.skip, true)
		assert.equal(msg.body.todo, true)
	})

	it("should accept format option and validate it", () => {
		const msg = new ParseMessage({ body: { format: "md" } })
		assert.equal(msg.body.format, "md")
	})

	it.todo("should reject invalid format option", () => {
		assert.throws(() => {
			new ParseMessage({ body: { format: "invalid" } })
		}, /Error/)
	})

	it("should filter only fail messages", async () => {
		class TestParseCommand extends ParseCommand {
			fs = fs
			async readInput() {
				return await fs.loadDocument("parse.test.context.txt", "")
			}
		}
		const cmd = new TestParseCommand()
		const msg1 = new ParseMessage({ opts: { fail: true } })
		const output = []
		for await (const out of cmd.run(msg1)) output.push(out)
		const content = output.join("\n")
		assert.ok(content.includes("✖ failing tests:"))
		assert.equal(content.trim().split("\n").length, 193)
	})
	it("should filter only fail & todo messages", async () => {
		class TestParseCommand extends ParseCommand {
			fs = fs
			async readInput() {
				return await fs.loadDocument("parse.test.context.txt", "")
			}
		}
		const cmd = new TestParseCommand()
		const msg2 = new ParseMessage({ opts: { fail: true, todo: true } })
		const output = []
		for await (const out of cmd.run(msg2)) output.push(out)
		const content = output.join("\n")
		assert.equal(content.includes("should calculate relative paths"), true)
		assert.equal(content.trim().split("\n").length, 193)
	})
})
