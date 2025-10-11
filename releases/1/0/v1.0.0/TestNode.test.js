import { before, describe, it } from "node:test"
import assert from "node:assert"
import TestNode from "../../src/Parser/TestNode.js"

describe("TestNode", () => {
	it("Extract metadata like test counts, duration, version", () => {
		const node = new TestNode({
			children: [
				{ content: 'TAP version 13' },
				{ content: '# tests 28' },
				{ content: '# duration_ms 303.132125' }
			]
		})

		assert.strictEqual(node.version, 13)
		assert.strictEqual(node.testsCount, 28)
		assert.strictEqual(node.durationMs, 303.132125)
		assert.strictEqual(node.duration, 0.303132125)
	})

	it("Support nested test suites and subtests", () => {
		const node = new TestNode({
			content: '# Subtest: main test',
			children: [
				{
					content: '# Subtest: sub test',
					children: [
						{ content: 'ok 1 - sub test passed' }
					]
				},
				{ content: 'ok 1 - main test passed' }
			]
		})

		assert.strictEqual(node.children.length, 2)
		assert.strictEqual(node.children[0].children.length, 1)
		assert.strictEqual(node.children[0].children[0].content, 'ok 1 - sub test passed')
	})

	it("Provide easy access to TAP statistics through getters", () => {
		const node = new TestNode({
			children: [
				{ content: '# pass 25' },
				{ content: '# fail 2' },
				{ content: '# skipped 1' }
			]
		})

		assert.strictEqual(node.passCount, 25)
		assert.strictEqual(node.failCount, 2)
		assert.strictEqual(node.skipCount, 1)
	})

	it("Represent test output as hierarchical node structure", () => {
		const node = new TestNode({
			content: 'root',
			children: [
				{ content: 'child1', children: [{ content: 'grandchild' }] },
				{ content: 'child2' }
			]
		})

		assert.strictEqual(node.content, 'root')
		assert.strictEqual(node.children.length, 2)
		assert.strictEqual(node.children[0].content, 'child1')
		assert.strictEqual(node.children[0].children[0].content, 'grandchild')
	})

	it("Find specific content by prefix matching", () => {
		const node = new TestNode({
			children: [
				{ content: 'TAP version 13' },
				{ content: '# tests 5' }
			]
		})

		assert.strictEqual(node.findPrefix('TAP version '), '13')
		assert.strictEqual(node.findPrefix('# tests '), '5')
	})

	it("Maintain relationship between parent and child tests", () => {
		const parent = new TestNode({ content: 'parent' })
		const child = new TestNode({ content: 'child' })

		parent.children.push(child)

		assert.strictEqual(parent.children[0], child)
		assert.ok(child instanceof TestNode)
	})
})
