import { describe, it } from "node:test"
import { strict as assert } from "node:assert"

import { CoverageCommandMessage } from "./coverage.js"

describe("CoverageCommand", () => {
	it("should parse CoverageCommandMessage with default options", () => {
		const msg = new CoverageCommandMessage({})
		assert.equal(msg.opts.help, false)
	})

	it("should parse CoverageCommandMessage with custom options", () => {
		const msg = new CoverageCommandMessage({ opts: { help: "true" } })
		assert.equal(msg.opts.help, true)
	})
})
