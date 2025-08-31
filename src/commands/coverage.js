import process from "node:process"

import FS from "@nan0web/db-fs"
import { Command, CommandMessage } from "@nan0web/co"
import runSpawn from "../exec/runSpawn.js"

class CoverageCommandOptions {
	help
	constructor(input) {
		const {
			help
		} = input
		this.help = String(help)
	}
	/**
	 * @param {*} input
	 * @returns {CoverageCommandOptions}
	 */
	static from(input) {
		if (input instanceof CoverageCommandOptions) return input
		return new CoverageCommandOptions(input)
	}
}

/**
 * @extends {CommandMessage}
 */
export class CoverageCommandMessage extends CommandMessage {
	/** @type {CoverageCommandOptions} */
	opts
	constructor(input) {
		super(input)
		this.opts = CoverageCommandOptions.from(input.opts ?? {})
	}
}

/**
 * @extends {Command}
 */
export default class CoverageCommand extends Command {
	static Message = CoverageCommandMessage
	constructor() {
		super({
			name: "coverage",
			help: "Run test coverage and save structured report to `.coverage/test.json`",
		})
	}

	/**
	 * @docs
	 * # `nan0test coverage`
	 *
	 * Runs test coverage and saves structured report to `.coverage/test.json`.
	 *
	 * Automatically detects context:
	 * - If running in `@nan0web/test`: uses raw Node.js coverage
	 * - Else: spawns `node --test` with coverage enabled
	 *
	 * Output includes line, branch, function coverage and uncovered lines.
	 *
	 * ```bash
	 * nan0test coverage
	 * ```
	 * @param {CoverageCommandMessage} msg
	 */
	async run(msg) {
		const fs = new FS()

		// Load package.json
		const pkg = await fs.loadDocument("package.json", {})
		const { name, scripts = {} } = pkg

		if (!name) {
			throw new Error("Missing package name in package.json")
		}

		const isSelfPackage = name === "@nan0web/test"

		this.logger.info(`📦 Package: ${name}`)
		this.logger.info(`🔍 Mode: ${isSelfPackage ? "Direct Node Coverage" : "Spawned Test Runner"}\n`)

		const chunks = []
		const suites = { ok: 0, notOk: 0 }
		const tests = { ok: 0, notOk: 0 }
		let checkpoint = Date.now()

		const onData = (chunk) => {
			const rows = String(chunk).split("\n")
			rows.forEach(row => {
				const trimmed = row.trim()
				if (row.startsWith("not ok ")) suites.notOk++
				else if (row.startsWith("ok ")) suites.ok++
				else if (trimmed.startsWith("not ok ")) tests.notOk++
				else if (trimmed.startsWith("ok ")) tests.ok++
				chunks.push([row, Date.now() - checkpoint])
			})
			checkpoint = Date.now()
			this.logger.cursorUp(7, true)
			const fail = tests.notOk ? `❗️ failed tests (${suites.notOk} suites)` : ""
			this.logger.info(`${tests.ok} ✅ passed tests (${suites.ok} suites) : ${tests.notOk} ${fail}`)
			const tail = chunks.filter(([s]) => Boolean(s)).slice(-5)
			while (tail.length < 5) tail.push(["", 0])
			tail.forEach(([t]) => this.logger.info(this.logger.cut("  " + t)))
		}

		let result, args, cmd

		// === Decision Tree ===
		if (isSelfPackage) {
			// Direct execution: @nan0web/test runs its own tests
			args = [
				'--experimental-test-coverage',
				'--test-coverage-include="src/**/*.js"',
				'--test-coverage-exclude="src/**/*.test.js"',
				'--test',
				'"src/**/*.test.js"',
			]
			cmd = "node"
			this.logger.info("🚀 Running direct coverage:")
		} else {
			// External package: use `node --test` or delegate safely
			if (!scripts["test:coverage"] && !scripts.test) {
				throw new Error(
					'No "test:coverage" or "test" script found in package.json'
				)
			}

			const hasNativeCoverage = scripts["test:coverage"]?.includes("--experimental-test-coverage")

			if (hasNativeCoverage) {
				args = ["run", "test:coverage"]
				cmd = "npm"; // or pnpm? use `pkg.packageManager`?
			} else {
				// Default fallback
				args = [
					"--experimental-test-coverage",
					'--test-coverage-output="coverage.json"',
					'--test-coverage-report=lcov',
					'--test-coverage-include="src/**/*.js"',
					'--test-coverage-exclude="src/**/*.test.js"',
					"--test",
					'"src/**/*.test.js"',
				]
				cmd = "node"
			}

			this.logger.info("🕹️ Running spawned coverage:")
		}
		result = await runSpawn(cmd, args, { onData, cwd: process.cwd() })
		this.logger.info(cmd + " " + args.join(" ") + "\n".repeat(7))

		if (result.code !== 0) {
			this.logger.error("❌ Coverage run failed with exit code:", result.code)
			process.exit(result.code)
		}

		const map = this.extractCoverage(result.text)
		if (!map.size) {
			this.logger.warn("⚠️ No coverage report found in output.")
		}
		// Save to .coverage/test.json
		await fs.saveDocument(".coverage/test.json", map)
		this.logger.info(`💾 Coverage saved to ./.coverage/test.json (${map.size} files)`)
	}

	/**
	 * Parses coverage lines formatted like:
	 *  src/README.md.js | 100 | 100 | 100 |
	 *  src/bin/coverage.js | 85.7 | 50 | 100 | 7:8:9
	 * @param {string} text
	 * @returns {Map<string, { line: number, branch: number, funcs: number, uncovered }>}
	 */
	extractCoverage(text) {
		const rows = text.split("\n")
		const startIndex = rows.findIndex(r => "# start of coverage report" === r)
		const endIndex = rows.findIndex(r => "# end of coverage report" === r)
		const coverage = rows.slice(startIndex, endIndex)
		if (coverage.length > 4) {
			const files = coverage.slice(4, -1)
			const map = new Map(files.filter(row => !row.trim().startsWith("# ---")).map(row => {
				let [name, lineStr, branchStr, funcsStr, uncoveredStr = ""] = row.split(" | ")
				name = name.trim().slice(2)
				const line = parseFloat(lineStr.trim())
				const branch = parseFloat(branchStr.trim())
				const funcs = parseFloat(funcsStr.trim())
				const uncovered = uncoveredStr.trim().split(" ").filter(Boolean)
				return [name, { line, branch, funcs, uncovered }]
			}))
			return map
		}
		return new Map()
	}
}
