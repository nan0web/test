import { before, describe, it } from "node:test"
import assert from "node:assert"
import NodeTestParser from "../../src/Parser/NodeTestParser.js"

describe("NodeTestParser", () => {
	it("Parse TAP text into TestNode tree structures", () => {
		const parser = new NodeTestParser()
		const tapText = "TAP version 13\nok 1 - first test\n1..1"
		
		const root = parser.decode(tapText)
		
		assert.ok(root instanceof TestNode)
		assert.strictEqual(root.children.length, 3)
		assert.strictEqual(root.children[0].content, 'TAP version 13')
	})

	it("Generate TAP text from node hierarchies", () => {
		const parser = new NodeTestParser()
		const rootNode = new TestNode({
			children: [
				new TestNode({ content: 'TAP version 13' }),
				new TestNode({ content: 'ok 1 - first test' }),
				new TestNode({ content: '1..1' })
			]
		})

		const encoded = parser.encode(rootNode)
		const expectedText = 'TAP version 13\nok 1 - first test\n1..1'
		assert.strictEqual(encoded, expectedText)
	})

	it("Handle indentation and subtest nesting correctly", () => {
		const parser = new NodeTestParser({ tab: '    ' }) // 4 spaces
		const tapText = "# Subtest: main\n    # Subtest: sub\n        ok 1 - test\n        1..1\n    ok 1 - main\n1..1"
		
		const root = parser.decode(tapText)
		
		assert.strictEqual(root.children.length, 3)
		assert.strictEqual(root.children[1].children.length, 2)
		assert.strictEqual(root.children[1].children[0].children.length, 2)
	})

	it("Support standard TAP version 13 format", () => {
		const parser = new NodeTestParser()
		const tapText = "TAP version 13\nok 1 - test\n1..1"
		
		const root = parser.decode(tapText)
		
		assert.strictEqual(root.version, 13)
	})

	it("Extract detailed test execution metrics", () => {
		const parser = new NodeTestParser({ tab: '    ' })
		const tapText = "# tests 10\n# pass 8\n# fail 2\n# duration_ms 150.5"
		
		const root = parser.decode(tapText)
		
		assert.strictEqual(root.testsCount, 10)
		assert.strictEqual(root.passCount, 8)
		assert.strictEqual(root.failCount, 2)
		assert.strictEqual(root.durationMs, 150.5)
	})

	it("Reconstruct original test output from parsed data", () => {
		const parser = new NodeTestParser({ tab: '    ' })
		const original = "# Subtest: test\n    ok 1 - subtest\n    1..1\nok 1 - test\n1..1"
		
		const root = parser.decode(original)
		const reconstructed = parser.encode(root)
		
		assert.strictEqual(reconstructed.trim(), original.trim())
	})
})