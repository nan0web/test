import { describe, it } from "node:test"
import assert from "node:assert"
import runSpawn from "../../src/exec/runSpawn.js"

describe("runSpawn", () => {
	it("Execute external processes and return exit codes", async () => {
		const { code, text } = await runSpawn('echo', ['test'])

		assert.strictEqual(code, 0)
		assert.ok(text.includes('test'))
	})

	it("Capture stdout content for verification", async () => {
		const { text } = await runSpawn('echo', ['hello world'])

		assert.ok(text.includes('hello world'))
	})

	it("Handle custom data processing callbacks", async () => {
		let processedData = ''
		const onData = (data) => {
			processedData += data.toString()
		}

		const { code, text } = await runSpawn('echo', ['callback test'], { onData })

		assert.strictEqual(code, 0)
		assert.ok(text.includes('callback test'))
		assert.ok(processedData.includes('callback test'))
	})

	it("Promise-based interface for child processes", async () => {
		// The function already returns a promise as verified by other tests
		const result = runSpawn('echo', ['promise'])
		assert.ok(result instanceof Promise)

		const { code, text } = await result
		assert.strictEqual(code, 0)
		assert.ok(text.includes('promise'))
	})

	it("Support for command arguments and spawn options", async () => {
		const { code, text } = await runSpawn('sh', ['-c', 'echo "with options"'])

		assert.strictEqual(code, 0)
		assert.ok(text.includes('with options'))
	})

	it("Graceful handling of process errors", async () => {
		const { code } = await runSpawn('sh', ['-c', 'exit 1'])

		assert.strictEqual(code, 1)
	})
})
