import assert from 'node:assert'
import { describe, it } from 'node:test'
import DB from "@nan0web/db-fs"
import { Node, to } from "@nan0web/types"
import TapParser from './TapParser.js'

const nodeJsTest = [
	"TAP version 13",
	"# Subtest: main test",
	"    # Subtest: sub test 1",
	"        ok 1 - sub test 1 passed",
	"        1..1",
	"    ok 1 - main test",
	"1..1",
].join("\n")

describe('TapParser', () => {
	it('should decode a simple TAP output correctly', () => {
		const text = 'TAP version 13\nok 1 - first test\nnot ok 2 - second test\n1..2'
		const parser = new TapParser()
		const root = parser.decode(text)

		assert.strictEqual(root.children.length, 4)
		assert.strictEqual(root.children[0].content, 'TAP version 13')
		assert.strictEqual(root.children[1].content, 'ok 1 - first test')
		assert.strictEqual(root.children[2].content, 'not ok 2 - second test')
		assert.strictEqual(root.children[3].content, '1..2')
	})

	it('should encode a simple tree back to TAP output', () => {
		const parser = new TapParser()
		const root = new Node({
			children: [
				new Node({ content: 'TAP version 13' }),
				new Node({ content: 'ok 1 - first test' }),
				new Node({ content: 'not ok 2 - second test' }),
				new Node({ content: '1..2' })
			]
		})

		const encoded = parser.encode(root)
		const expectedText = 'TAP version 13\nok 1 - first test\nnot ok 2 - second test\n1..2\n'
		assert.strictEqual(encoded, expectedText)
	})

	it('should decode subtests correctly', () => {
		const parser = new TapParser({ tab: '    ' }) // 4 spaces for this test
		const root = parser.decode(nodeJsTest)

		assert.strictEqual(root.children.length, 3)
		assert.strictEqual(root.children[0].content, 'TAP version 13')
		assert.strictEqual(root.children[1].content, '# Subtest: main test')
		assert.strictEqual(root.children[1].children.length, 2)
		assert.strictEqual(root.children[1].children[0].content, '# Subtest: sub test 1')
		assert.strictEqual(root.children[1].children[0].children.length, 2)
		assert.strictEqual(root.children[1].children[0].children[0].content, 'ok 1 - sub test 1 passed')
		assert.strictEqual(root.children[1].children[0].children[1].content, '1..1')
		assert.strictEqual(root.children[1].children[1].content, 'ok 1 - main test')
		assert.strictEqual(root.children[2].content, '1..1')
	})

	it('should encode subtests correctly', () => {
		const parser = new TapParser({ tab: '    ' })
		const rootNode = parser.decode(nodeJsTest)

		const result = rootNode.flat().map(
			node => (
				{
					content: node.content,
					indent: node.indent,
					childCount: node.children.length
				}
			)
		)

		// Remove the root node from the result since it's not part of the expected output
		const filteredResult = result.slice(1)

		assert.deepStrictEqual(filteredResult, [
			{ content: "TAP version 13", indent: 0, childCount: 0 },
			{ content: "# Subtest: main test", indent: 0, childCount: 2 },
			{ content: "# Subtest: sub test 1", indent: 1, childCount: 2 },
			{ content: "ok 1 - sub test 1 passed", indent: 2, childCount: 0 },
			{ content: "1..1", indent: 2, childCount: 0 },
			{ content: "ok 1 - main test", indent: 1, childCount: 0 },
			{ content: "1..1", indent: 0, childCount: 0 },
		])

		const encoded = parser.encode(rootNode)
		assert.deepStrictEqual(encoded, nodeJsTest + '\n')
	})

	it("should parse file node:test-output.txt", async () => {
		const db = new DB()
		const text = await db.loadDocument("src/Parser/TapParser.test.txt")
		const parser = new TapParser()
		const root = parser.decode(text)
		assert.ok(root)
		assert.equal(root.testsCount, 54)
		assert.equal(root.suitesCount, 11)
		assert.equal(root.passCount, 50)
		assert.equal(root.failCount, 2)
		assert.equal(root.cancelledCount, 0)
		assert.equal(root.skipCount, 1)
		assert.equal(root.todoCount, 1)
		assert.equal(root.duration.toFixed(1), 2.5)
		assert.equal(root.durationMs.toFixed(1), "2501.1")
	})

	it('should handle empty lines in TAP output', () => {
		const text = 'TAP version 13\n\nok 1 - first test\n\nnot ok 2 - second test\n\n1..2\n'
		const parser = new TapParser()
		const root = parser.decode(text)

		assert.strictEqual(root.children.length, 4)
		assert.strictEqual(root.children[0].content, 'TAP version 13')
		assert.strictEqual(root.children[1].content, 'ok 1 - first test')
		assert.strictEqual(root.children[2].content, 'not ok 2 - second test')
		assert.strictEqual(root.children[3].content, '1..2')
	})
})
