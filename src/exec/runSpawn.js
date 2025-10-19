import { spawn } from 'node:child_process'

/** @typedef {{ code: number; text: string, error: string }} SpawnResult */

/**
 * Spawns a child process and returns a promise that resolves when the process closes.
 *
 * @param {string} cmd - The command to run.
 * @param {string[]} [args=[]] - List of arguments to pass to the command.
 * @param {Object} [opts={}] - Options to pass to spawn.
 * @param {(chunk: Buffer) => void} [opts.onData] - Callback for handling data from stdout. Default is no-op.
 * @param {string} [opts.cwd] - Current working directory.
 *
 * @returns {Promise<SpawnResult>} A promise resolving with process exit code and stdout content.
 *
 * @example
 * const { code, text } = await runSpawn('git', ['remote', 'get-url', 'origin']);
 */
export default async function runSpawn(cmd, args = [], opts = {}) {
	// Spawn process to check git remote URL
	return new Promise((resolve) => {
		const {
			onData = () => 1,
			...spawnOptions
		} = opts
		const result = spawn(cmd, args, spawnOptions)
		let text = ''
		let error = ""

		result.stderr.on('data', (data) => {
			error += data.toString()
			onData(data)
		})

		result.stderr.on('error', (data) => {
			error += data.toString()
			onData(Buffer.from(data.message))
		})

		result.stdout.on('data', (data) => {
			text += data.toString()
			onData(data)
		})

		result.stdout.on('error', (data) => {
			error += data.toString()
			// onData(data)
		})

		result.on('close', (code) => {
			resolve({ code: code ?? 0, text, error })
		})
	})
}
