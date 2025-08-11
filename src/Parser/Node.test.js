import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import TestNode from './Node.js'

describe('TestNode', () => {
	it('should correctly parse TAP version', () => {
		const node = new TestNode({ children: [{ content: 'TAP version 13' }] })
		strictEqual(node.version, 13)
	})

	it('should return 0 for missing TAP version', () => {
		const node = new TestNode()
		strictEqual(node.version, 0)
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

		strictEqual(node.testsCount, 28)
		strictEqual(node.suitesCount, 2)
		strictEqual(node.passCount, 27)
		strictEqual(node.failCount, 1)
		strictEqual(node.cancelledCount, 0)
		strictEqual(node.skippedCount, 0)
		strictEqual(node.todoCount, 0)
		strictEqual(node.durationMs, 303.132125)
		strictEqual(node.duration, 0.303132125)
	})
})
