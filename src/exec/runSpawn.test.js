import { describe, it } from 'node:test'
import assert from 'node:assert'
import runSpawn from './runSpawn.js'

describe('runSpawn', () => {
	it('should spawn a process and resolve with output and exit code', async () => {
		const { code, text } = await runSpawn('echo', ['hello world'])

		assert.strictEqual(code, 0)
		assert.ok(text.includes('hello world'))
	})

	it('should handle custom onData callback', async () => {
		let onDataOutput = ''
		const onDataSpy = (data) => {
			onDataOutput += data.toString()
		}
		const { code, text } = await runSpawn('echo', ['test data'], { onData: onDataSpy })

		assert.strictEqual(code, 0)
		assert.ok(onDataOutput.includes('test data'))
		assert.ok(text.includes('test data'))
	})

	it('should resolve even if process fails', async () => {
		const { code, text } = await runSpawn('sh', ['-c', 'exit 1'])

		assert.strictEqual(code, 1)
		assert.strictEqual(text.trim(), '')
	})
})