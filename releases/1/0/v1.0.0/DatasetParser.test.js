import { describe, it, before } from "node:test"
import assert from "node:assert"
import FS from "@nan0web/db-fs"

const fs = new FS()

describe("DatasetParser parses README into dataset", () => {
	before(async () => {
		await fs.connect()
	})
	it("should generate .datasets/README.dataset.jsonl during tests", async () => {
		const stat = await fs.statDocument(".datasets/README.dataset.jsonl")
		assert.ok(stat.exists)
	})
	it("should extract correct structure from README markdown", async () => {
		const rows = await fs.loadDocument(".datasets/README.dataset.jsonl")
		const firstEntry = rows[0]

		assert.ok(firstEntry.instruction)
		assert.ok(firstEntry.output)
		assert.ok(firstEntry.context)
		assert.ok(firstEntry.input)
		assert.ok(firstEntry.tags)
		assert.ok(firstEntry.proven)
	})
})
