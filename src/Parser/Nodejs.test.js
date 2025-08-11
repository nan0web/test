import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Node, to } from "@nan0web/types"
import NodejsParser from './Nodejs.js'

const nodeJsTest = [
	"TAP version 13",
	"# Subtest: main test",
	"    # Subtest: sub test 1",
	"        ok 1 - sub test 1 passed",
	"        1..1",
	"    ok 1 - main test",
	"1..1",
].join("\n")

describe('NodejsParser', () => {
	it('should decode a simple TAP output correctly', () => {
		const text = 'TAP version 13\nok 1 - first test\nnot ok 2 - second test\n1..2'
		const parser = new NodejsParser()
		const root = parser.decode(text)

		assert.strictEqual(root.children.length, 4)
		assert.strictEqual(root.children[0].content, 'TAP version 13')
		assert.strictEqual(root.children[1].content, 'ok 1 - first test')
		assert.strictEqual(root.children[2].content, 'not ok 2 - second test')
		assert.strictEqual(root.children[3].content, '1..2')
	})

	it('should encode a simple tree back to TAP output', () => {
		const parser = new NodejsParser()
		const root = new Node({
			children: [
				new Node({ content: 'TAP version 13' }),
				new Node({ content: 'ok 1 - first test' }),
				new Node({ content: 'not ok 2 - second test' }),
				new Node({ content: '1..2' })
			]
		})

		const encoded = parser.encode(root)
		const expectedText = 'TAP version 13\nok 1 - first test\nnot ok 2 - second test\n1..2'
		assert.strictEqual(encoded, expectedText)
	})

	it('should decode subtests correctly', () => {
		const parser = new NodejsParser({ tab: '    ' }) // 4 spaces for this test
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
		const parser = new NodejsParser({ tab: '    ' })
		const root = parser.decode(nodeJsTest)
		const rootNode = new Node({
			children: [
				new Node({ content: "TAP version 13" }),
				new Node({
					content: "# Subtest: main test",
					children: [
						new Node({
							content: "# Subtest: sub test 1",
							children: [
								new Node({ content: "ok 1 - sub test 1 passed" }),
								new Node({ content: "1..1" })
							]
						}),
						new Node({ content: "ok 1 - main test" }),
					]
				}),
				new Node({ content: "1..1" })
			]
		})

		assert.deepEqual(to(Object)(rootNode), to(Object)(root))

		const encoded = parser.encode(rootNode)
		assert.strictEqual(encoded, nodeJsTest)
	})
})
