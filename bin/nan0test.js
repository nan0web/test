#!/usr/bin/env node

import process from "node:process"

import { Command } from "@nan0web/ui-cli"
import Logger from "@nan0web/log"

import CoverageCommand from "../src/commands/coverage.js"
import ParseCommand from "../src/commands/parse.js"
import StatusCommand, { ProgressMessage } from "../src/commands/status.js"
import RunCommand from "../src/commands/run.js"

// === Main Command Setup ===

const logger = new Logger(Logger.detectLevel(process.argv))

// === Execution Logic ===

async function main(argv = []) {
	const args = argv.slice(2)
	const cmdName = args[0]

	// Manual routing for subcommands
	let cmd = null
	let subArgs = args.slice(1)

	if (cmdName === "status") {
		cmd = new StatusCommand({ logger })
	} else if (cmdName === "coverage") {
		cmd = new CoverageCommand({ logger })
	} else if (cmdName === "parse") {
		cmd = new ParseCommand({ logger })
	} else if (cmdName === "run") {
		cmd = new RunCommand({ logger })
	}

	if (cmd) {
		logger.debug("Sub command:", cmdName)
		logger.debug("Sub args:", subArgs)

		// Create message from sub args
		const msg = new Command({ head: { name: cmdName }, body: {} }).parse(subArgs)
		let progress = 0, started = 0, interval, str = ""
		const fn = () => {
			logger.cursorUp(progress, true)
			const elapsed = Number((Date.now() - started) / 1e3).toFixed(1)
			const info = [elapsed + "s", str.body.join("\n")].join(" ")
			logger.info(info)
			progress = info.split("\n").length
		}
		for await (const out of cmd.run(msg)) {
			if (out instanceof ProgressMessage) {
				str = out
				if (!interval && process.stdout.isTTY) {
					started = Date.now()
					interval = setInterval(fn, 33)
				}
			} else {
				progress = 0
				if (interval) {
					started = 0
					clearInterval(interval)
				}
				logger.info(out.body.join("\n"))
			}
		}
	} else {
		logger.debug("Input args:", args)
		logger.info(`Usage: nan0test <command> [options]

Commands:
  status    Show package status including tests, coverage, docs, and release info
  coverage  Run test coverage and save structured report to .coverage/test.json
  parse     Parse Node.js test output in TAP format (with filters: --fail, --skip, --todo)
  run       Run all tests (build, test, test:docs) and output results to me.md

Use "nan0test <command> --help" for more info.`)
	}
}

main(process.argv).catch(err => {
	logger.error("❌ Unhandled error:", err.message || err)
	if (err.stack) logger.debug(err.stack)
	process.exit(1)
})

