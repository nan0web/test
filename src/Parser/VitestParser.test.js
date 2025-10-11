import assert from 'node:assert'
import { describe, it, before } from 'node:test'
import FS from "@nan0web/db-fs"
import VitestParser from './VitestParser.js'
import TestNode from './TestNode.js'

const fs = new FS()

/**
 * @todo implement the vitest parser in a simplest way, possible is to use reporter: tap, that is already done as TapParser and TestNode.
 */
describe.skip('VitestParser', () => {
	let vitestOutput = ""
	before(async () => {
		await fs.connect()
		vitestOutput = await fs.loadDocument("src/Parser/VitestParser.test.txt", "")
	})
	it('should decode a simple Vitest output correctly', () => {
		const text = ' RUN  v3.2.4 /some/path\n Test Files  1 passed (1)\n      Tests  2 passed (2)'
		const parser = new VitestParser()
		const root = parser.decode(text)

		assert.strictEqual(root.children.length, 2)
		assert.strictEqual(root.children[0].content, ' RUN  v3.2.4 /some/path')
		assert.strictEqual(root.children[1].content, ' Test Files  1 passed (1)')
	})

	it('should encode a simple tree back to Vitest output', () => {
		const parser = new VitestParser()
		const root = new TestNode({
			children: [
				new TestNode({ content: ' RUN  v3.2.4 /some/path' }),
				new TestNode({ content: ' Test Files  1 passed (1)' }),
				new TestNode({ content: '      Tests  2 passed (2)' })
			]
		})

		const encoded = parser.encode(root)
		const expectedText = ' RUN  v3.2.4 /some/path\n Test Files  1 passed (1)\n      Tests  2 passed (2)\n'
		assert.strictEqual(encoded, expectedText)
	})

	it('should decode nested test structure correctly', async () => {
		const parser = new VitestParser({ tab: '  ' }) // 2 spaces for this test
		const root = parser.decode(vitestOutput)

		assert.ok(root)
		await fs.saveDocument("dist/test/nested.txt", parser.stringify(root))
		assert.strictEqual(root.children.length, 24)

		// Check first line
		assert.strictEqual(root.children[0].content, ' RUN  v3.2.4 /Users/i/src/nan.web/packages/ui-react-bootstrap')

		// Check nested structure
		const cardTestNode = root.children[2]
		assert.strictEqual(cardTestNode.content, ' ❯ src/components/molecules/Card.test.jsx (4 tests | 4 failed) 29ms')
		assert.strictEqual(cardTestNode.children.length, 4)

		const firstFailedTest = cardTestNode.children[0]
		assert.strictEqual(firstFailedTest.content, '   × Card > renders Card with children 15ms')
		assert.strictEqual(firstFailedTest.children.length, 1)
		assert.strictEqual(firstFailedTest.children[0].content, '     → cleanup is not defined')
	})

	it('should encode nested test structure correctly', async () => {
		const parser = new VitestParser({ tab: '  ' })
		const rootNode = parser.decode(vitestOutput)

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

		assert.deepStrictEqual(filteredResult[0], {
			content: " RUN  v3.2.4 /Users/i/src/nan.web/packages/ui-react-bootstrap",
			indent: 0,
			childCount: 0
		})

		const exp = vitestOutput.split("\n").map(s => s.trim()).filter(Boolean)
		const encoded = parser.stringify(parser.encode(rootNode)).split("\n").map(s => s.trim()).filter(Boolean)
		assert.deepStrictEqual(encoded, exp)
	})

	it('should handle empty lines in Vitest output', () => {
		const text = ' RUN  v3.2.4 /some/path\n\n Test Files  1 passed (1)\n\n      Tests  2 passed (2)\n'
		const parser = new VitestParser()
		const root = parser.decode(text)

		assert.strictEqual(root.children.length, 2)
		assert.strictEqual(root.children[0].content, ' RUN  v3.2.4 /some/path')
		assert.strictEqual(root.children[1].content, ' Test Files  1 passed (1)')
	})
})
