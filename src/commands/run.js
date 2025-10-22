import FS from "@nan0web/db-fs"
import { Command, str2argv } from "@nan0web/co"
import runSpawn from "../exec/runSpawn.js"

/**
 * Command to run all tests and output results to `me.md`.
 * This command executes build, test, and docs test scripts defined in package.json.
 * Results are saved to me.md for later review or integration.
 * @extends {Command}
 */
export default class RunCommand extends Command {
	constructor() {
		super({
			name: "run",
			help: "Run all tests and outputs into `me.md`",
		})
	}

	/**
	 * Formats a script command and its output for documentation.
	 * @param {string} target - The name of the script being run.
	 * @param {string} text - The output of the script.
	 * @returns {string} - Formatted markdown code block.
	 */
	script(target, text) {
		return "#### `" + target + "`\n```bash\n" + text + "\n```\n\n"
	}

	/**
	 * Executes a child process using spawn.
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
	 */
	async run() {
		const fs = new FS()

		// Load package.json
		const pkg = await this.loadPackageJson(fs)
		const { name, scripts = {} } = pkg

		if (!name) {
			throw new Error("Missing package name in package.json")
		}

		this.logger.info(`📦 Package: ${name}`)

		const chunks = []
		let checkpoint = Date.now()

		const onData = (chunk) => {
			const rows = String(chunk).split("\n")
			rows.forEach(row => {
				chunks.push([row, Date.now() - checkpoint])
			})
			checkpoint = Date.now()
			this.logger.cursorUp(6, true)
			const tail = chunks.filter(([s]) => Boolean(s)).slice(-5)
			while (tail.length < 5) tail.push(["", 0])
			tail.forEach(([t]) => this.logger.info(this.logger.cut("  " + t)))
		}

		let result = ""
		this.logger.info("Starting tests")
		for (let i = 0; i < 5; i++) this.logger.info("")
		if (scripts['build']) {
			const [cmd, ...args] = str2argv(scripts['build'])
			const res = await this.runSpawn(cmd, args, { onData })
			result += this.script(scripts['build'], res.text)
			for (let i = 0; i < 6; i++) this.logger.info("")
		}
		if (scripts['test']) {
			const [cmd, ...args] = str2argv(scripts['test'])
			const res = await this.runSpawn(cmd, args, { onData })
			result += scripts['test'] + ":\n```bash\n" + res.text + "\n```\n"
			for (let i = 0; i < 6; i++) this.logger.info("")
		}
		if (scripts['test:docs']) {
			const [cmd, ...args] = str2argv(scripts['test:docs'])
			const res = await this.runSpawn(cmd, args, { onData })
			result += scripts['test:docs'] + ":\n```bash\n" + res.text + "\n```\n"
			for (let i = 0; i < 6; i++) this.logger.info("")
		}

		// Save to me.md
		await this.saveResult(fs, result)
		this.logger.info(`💾 Results saved to ./me.md`)
	}

	async loadPackageJson(fs) {
		return await fs.loadDocument("package.json", {})
	}

	/**
	 * Saves the test results to a file.
	 * @param {FS} fs - The filesystem instance.
	 * @param {string} result - The content to save.
	 * @returns {Promise<void>} - Promise that resolves when the file is saved.
	 */
	async saveResult(fs, result) {
		await fs.saveDocument("me.md", result)
	}
}
