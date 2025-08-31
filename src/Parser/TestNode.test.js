import { describe, it } from 'node:test'
import assert from 'node:assert'
import TestNode from './TestNode.js'

describe('TestNode', () => {
	it('should correctly parse TAP version', () => {
		const node = new TestNode({ children: [{ content: 'TAP version 13' }] })
		assert.strictEqual(node.version, 13)
	})

	it('should return 0 for missing TAP version', () => {
		const node = new TestNode()
		assert.strictEqual(node.version, 0)
	})

	it('should correctly parse test counts', () => {
		const node = new TestNode({
			children: [
				{ content: '# tests 28' },
				{ content: '# suites 2' },
				{ content: '# pass 27' },
				{ content: '# fail 1' },
				{ content: '# cancelled 0' },
				{ content: '# skipped 0' },
				{ content: '# todo 0' },
				{ content: '# duration_ms 303.132125' }
			]
		})

		assert.strictEqual(node.testsCount, 28)
		assert.strictEqual(node.suitesCount, 2)
		assert.strictEqual(node.passCount, 27)
		assert.strictEqual(node.failCount, 1)
		assert.strictEqual(node.cancelledCount, 0)
		assert.strictEqual(node.skippedCount, 0)
		assert.strictEqual(node.todoCount, 0)
		assert.strictEqual(node.durationMs, 303.132125)
		assert.strictEqual(node.duration, 0.303132125)
	})

	it('should calculate duration in seconds correctly', () => {
		const node = new TestNode({
			children: [
				{ content: '# duration_ms 1_500' }
			]
		})
		assert.strictEqual(node.duration, 1.5)
	})

	it('should handle missing duration_ms gracefully', () => {
		const node = new TestNode()
		assert.strictEqual(node.durationMs, 0)
		assert.strictEqual(node.duration, 0)
	})

	it('should find prefixed content correctly', () => {
		const node = new TestNode({
			children: [
				{ content: 'TAP version 13' },
				{ content: '# tests 5' }
			]
		})
		assert.strictEqual(node.findPrefix('TAP version '), '13')
		assert.strictEqual(node.findPrefix('# tests '), '5')
		assert.strictEqual(node.findPrefix('Nonexistent '), '')
	})
})
