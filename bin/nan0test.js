#!/usr/bin/env node

import process from "node:process"
import { Command } from "@nan0web/co"
import StatusCommand from "../src/commands/status.js"
import CoverageCommand from "../src/commands/coverage.js"
import Logger from "@nan0web/log"

// === Main Command Setup ===

const logger = new Logger(Logger.detectLevel(process.argv))

const mainCommand = new Command({
	name: "nan0test",
	help: "Test utilities for nan0web packages",
	logger,
	subcommands: [
		new StatusCommand({ logger }),
		new CoverageCommand({ logger }),
	],
})

// === Execution Logic ===

async function main(argv = []) {
	const msg = mainCommand.parse(argv.slice(2))

	if (msg.subCommand) {
		/** @type {StatusCommand | CoverageCommand} */
		const cmd = mainCommand.getCommand(msg.subCommand)

		logger.debug("Sub command:")
		logger.debug(cmd)
		logger.debug(JSON.stringify(msg, null, 2))

		await cmd.run(msg.subCommandMessage)
	} else {
		logger.debug("Input command message:")
		logger.debug(JSON.stringify(msg, null, 2))
		logger.info(mainCommand.runHelp())
	}
}

main(process.argv).catch(err => {
	logger.error("❌ Unhandled error:", err.message || err)
	if (err.stack) logger.debug(err.stack)
	process.exit(1)
})
