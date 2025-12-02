import { spawn } from 'node:child_process'

/** @typedef {import("@nan0web/log").default} Logger */

/**
 * @typedef {{
 *   code: number;
 *   text: string;
 *   error: string;
 * }} SpawnResult
 */

/**
 * @typedef {{
 *   onData?: (chunk: Buffer) => void;
 *   cwd?: string | URL;
 *   env?: NodeJS.ProcessEnv;
 *   argv0?: string;
 *   stdio?: import('node:child_process').StdioOptions;
 *   detached?: boolean;
 *   shell?: boolean | string;
 *   windowsVerbatimArguments?: boolean;
 *   windowsHide?: boolean;
 *   timeout?: number;
 *   uid?: number;
 *   gid?: number;
 *   serialization?: import('node:child_process').SerializationType;
 *   killSignal?: NodeJS.Signals | number;
 *   signal?: AbortSignal;
 * }} RunSpawnOptions
 */

/**
 * @typedef {Object} Progress
 * @property {number} [height=0]
 * @property {number} [width=0]
 * @property {Logger | undefined} [logger]
 */

/**
 * Spawns a child process and returns a promise that resolves when the process closes.
 *
 * @param {string} cmd - The command to run.
 * @param {string[]} [args=[]] - List of arguments to pass to the command.
 * @param {RunSpawnOptions & { progress?: Progress }} [opts={}] - Options to pass to spawn.
 *
 * @returns {Promise<SpawnResult>} A promise resolving with process exit code and stdout content.
 *
 * @example
 * const { code, text } = await runSpawn('git', ['remote', 'get-url', 'origin']);
 */
export default async function runSpawn(cmd, args = [], opts = {}) {
	// Spawn process to check git remote URL
	const {
		onData = () => 1,
		progress = { width: 0, height: 0, logger: undefined },
		...spawnOptions
	} = opts
	const [w, h] = progress.logger ? progress.logger.getWindowSize() : [160, 80]
	const width = Math.min(w, progress.width || Infinity)
	const height = Math.min(h, progress.height || Infinity)
	let printed = false

	const showProgress = (str, type = "info", first = false) => {
		if (progress.logger && height) {
			printed = true
			if (!first) progress.logger.cursorUp(height)
			const rows = str.split("\n")
			const line = progress.logger.fill(rows.shift(), width)
			progress.logger[type](line)
			if (height > 1) {
				const subType = "error" === type ? "warn" : type
				const top = Math.min(height - 1, rows.length)
				for (let i = 0; i < top; i++) {
					progress.logger[subType](progress.logger.fill(rows[i], width))
				}
			}
		}
	}

	const clearProgress = () => {
		if (progress.logger && height && printed) {
			progress.logger.cursorUp(height, true)
		}
	}

	showProgress(
		["Running > ", "        >\n".repeat((height || 1) - 1)].join("\n"),
		"info",
		true,
	)

	return new Promise((resolve, reject) => {
		const result = spawn(cmd, args, spawnOptions)
		let text = ''
		let error = ""


		result.on('error', (err) => {
			clearProgress()
			reject(err)
			return
		})

		result.stderr?.on('data', (data) => {
			const str = data.toString()
			error += str
			onData(data)
			if (progress.logger && height) {
				progress.logger.error(progress.logger.fill(str, width))
			}
		})

		result.stderr?.on('error', (data) => {
			error += data.toString()
			onData(Buffer.from(data.message))
			showProgress([data.message, data.stack || ""].join("\n"), "error")
		})

		result.stdout?.on('data', (data) => {
			const str = data.toString()
			text += str
			onData(data)
			showProgress(str)
		})

		result.stdout?.on('error', (data) => {
			const str = data.toString()
			error += str
			// onData(data)
			showProgress(str, "error")
		})

		result.on('close', (code) => {
			clearProgress()
			resolve({ code: code ?? 0, text, error })
		})
	})
}
