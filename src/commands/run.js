import FS from "@nan0web/db-fs"
import { CLI, str2argv } from "@nan0web/ui-cli"
import runSpawn from "../exec/runSpawn.js"
import Message, { OutputMessage } from "@nan0web/co"

class Run extends Message {
	static name = "run"
	static help = "Run all tests and outputs into `me.md`"
}

/**
 * Command to run all tests and output results to `me.md`.
 * This command executes build, test, and docs test scripts defined in package.json.
 * Results are saved to me.md for later review or integration.
 * @extends {CLI}
 */
export default class RunCommand extends CLI {
	constructor() {
		super({
			Messages: [Run],
		})
	}

	/**
	 * Formats a script command and its output for documentation.
	 *
	 * @param {string} target - The name of the script being run.
	 * @param {string} text - The output of the script.
	 * @returns {string} - Formatted markdown code block.
	 */
	script(target, text) {
		return "#### `" + target + "`\n```bash\n" + text + "\n```\n\n"
	}

	/**
	 * Executes a child process using spawn.
	 *
	 * @param {string} cmd - Command to execute.
	 * @param {string[]} args - Arguments for the command.
	 * @param {Object} opts - Options for spawn.
	 * @returns {Promise<{ code: number, text: string, error: string }>} - Result of the spawn operation.
	 */
	async runSpawn(cmd, args, opts) {
		return await runSpawn(cmd, args, opts)
	}

	/**
	 * @docs
	 * # `nan0test run`
	 *
	 * Run all tests and outputs into `me.md`.
	 *
	 * Automatically detects context from package.json:
	 * - scripts{build, test, test:docs}
	 *
	 * ```bash
	 * nan0test run
	 * ```
	 * @param {Run} msg
	 * @returns {AsyncGenerator<OutputMessage, void, unknown>}
	 */
	async * run(msg = new Run()) {
		super.run()
		const fs = new FS()

		// Load package.json
		const pkg = await this.loadPackageJson(fs)
		const { name, scripts = {} } = pkg

		if (!name) {
			throw new Error("Missing package name in package.json")
		}

		yield new OutputMessage(`📦 Package: ${name}`)

		let chunks = []
		let checkpoint = Date.now()

		const onData = (chunk) => {
			const rows = String(chunk).split("\n")
			rows.forEach(row => {
				chunks.push([row, Date.now() - checkpoint])
			})
			checkpoint = Date.now()
		}

		let result = ""
		yield new OutputMessage("Starting tests")
		if (scripts['build']) {
			yield new OutputMessage(".. build")
			const [cmd, ...args] = str2argv(scripts['build'])
			const res = await this.runSpawn(cmd, args, { onData })
			const msg = this.script(scripts['build'], res.text)
			yield new OutputMessage(msg)
			result += msg
		}
		if (scripts['test']) {
			yield new OutputMessage(".. test")
			const [cmd, ...args] = str2argv(scripts['test'])
			const res = await this.runSpawn(cmd, args, { onData })
			const msg = scripts['test'] + ":\n```bash\n" + res.text + "\n```\n"
			yield new OutputMessage(msg)
			result += msg
		}
		if (scripts['test:docs']) {
			yield new OutputMessage(".. docs")
			const [cmd, ...args] = str2argv(scripts['test:docs'])
			const res = await this.runSpawn(cmd, args, { onData })
			const msg = scripts['test:docs'] + ":\n```bash\n" + res.text + "\n```\n"
			yield new OutputMessage(msg)
			result += msg
		}

		// Save to me.md
		await this.saveResult(fs, result)
		yield new OutputMessage(`💾 Results saved to ./me.md`)
	}

	async loadPackageJson(fs) {
		return await fs.loadDocument("package.json", {})
	}

	/**
	 * Saves the test results to a file.
	 *
	 * @param {FS} fs - The filesystem instance.
	 * @param {string} result - The content to save.
	 * @returns {Promise<void>} - Promise that resolves when the file is saved.
	 */
	async saveResult(fs, result) {
		await fs.saveDocument("me.md", result)
	}
}
