import { describe, it, beforeEach } from "node:test"
import assert from "node:assert"

import FS from "@nan0web/db-fs"
import BaseRunCommand from "./run.js"
import { NoLogger } from "@nan0web/log"

class RunCommand extends BaseRunCommand {
	results = []
	packageJson = {}
	async saveResult(fs, result) {
		this.results.push(result)
	}
	async loadPackageJson(fs) {
		return this.packageJson
	}
}

// Mock runSpawn to control command execution
const mockSpawn = async (cmd, args) => {
	return {
		code: 0,
		text: `Mock output for ${cmd} ${args.join(' ')}`,
		error: ''
	}
}

describe("RunCommand", () => {
	let fs
	let originalLoadDocument

	beforeEach(() => {
		fs = new FS()
		originalLoadDocument = fs.loadDocument
	})

	it("should import RunCommand", () => {
		assert.ok(RunCommand)
	})

	it("should run all test scripts and save to me.md", async () => {
		const command = new RunCommand({ logger: new NoLogger() })
		command.runSpawn = mockSpawn
		command.packageJson = {
			name: "@nan0web/test",
			scripts: {
				build: "tsc",
				test: "node --test src/*.test.js",
				"test:docs": "node --test src/README.md.js"
			}
		}
		await command.run()
		const content = command.results[0]
		assert.ok(content.includes("tsc"))
		assert.ok(content.includes("node --test src/*.test.js"))
		assert.ok(content.includes("node --test src/README.md.js"))
	})

	it("should handle missing package name", async () => {
		const command = new RunCommand({ logger: new NoLogger() })
		command.packageJson = { scripts: {} }
		command.runSpawn = mockSpawn

		await assert.rejects(
			async () => await command.run(),
			{
				name: 'Error',
				message: 'Missing package name in package.json'
			}
		)
	})

	it("should only run existing scripts", async () => {
		const command = new RunCommand({ logger: new NoLogger() })
		command.packageJson = {
			name: "@nan0web/test",
			scripts: {
				test: "node --test src/*.test.js"
			}
		}
		command.runSpawn = mockSpawn
		await command.run()

		// Should only contain test script output
		assert.ok(command.results[0].includes("node --test src/*.test.js"))
		assert.ok(!command.results[0].includes("tsc"))
		assert.ok(!command.results[0].includes("test:docs"))
	})
})
