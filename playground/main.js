#!/usr/bin/env node

import process from "node:process"
import Logger from "@nan0web/log"
import { select } from "@nan0web/ui-cli"
import { mockFetch } from "../src/index.js"
import MemoryDB from "../src/mock/MemoryDB.js"
import DocsParser from "../src/Parser/DocsParser.js"
import DatasetParser from "../src/Parser/DatasetParser.js"
import runSpawn from "../src/exec/runSpawn.js"

const console = new Logger({ level: "info" })

console.clear()
console.info(Logger.style(Logger.LOGO, { color: "cyan" }))

async function chooseDemo() {
	const demos = [
		{ name: "Mock Fetch Demo", value: "fetch" },
		{ name: "Memory DB Demo", value: "db" },
		{ name: "Docs Parser Demo", value: "docs" },
		{ name: "Dataset Parser Demo", value: "dataset" },
		{ name: "Run Spawn Demo", value: "spawn" },
		{ name: "← Exit", value: "exit" }
	]

	const choice = await select({
		title: "Select demo to run:",
		prompt: "[me]: ",
		invalidPrompt:
			Logger.style("[me invalid]", { color: "red" }) + ": ",
		options: demos.map(d => d.name),
		console
	})

	return demos[choice.index].value
}

async function runFetchDemo() {
	console.clear()
	console.success("Mock Fetch Demo")

	const routes = [
		["GET /users", [200, [{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Smith" }]]],
		["POST /users", [201, { message: "User created successfully!" }]],
		["GET /posts/*", { title: "Wildcard matched post" }],
		["* *", { message: "Catch-all route" }]
	]

	const fetch = mockFetch(routes)

	console.info("Testing mock fetch with various routes:\n")

	const tests = [
		{ method: "GET", url: "/users", description: "Get all users" },
		{ method: "POST", url: "/users", description: "Create new user" },
		{ method: "GET", url: "/posts/123", description: "Get specific post (wildcard)" },
		{ method: "DELETE", url: "/unknown", description: "Delete unknown route (catch-all)" }
	]

	for (const test of tests) {
		const response = await fetch(test.url, { method: test.method })
		const data = await response.json()

		console.info(`${test.description}:`)
		console.info(`  Status: ${response.status}`)
		console.info(`  OK: ${response.ok}`)
		console.info(`  Data: ${JSON.stringify(data, null, 2)}\n`)
	}

	console.success("Mock fetch demo complete! 🌐")
}

async function runDbDemo() {
	console.clear()
	console.success("Memory DB Demo")

	const db = new MemoryDB({
		predefined: new Map([
			["users.json", '[{ "id": 1, "name": "John Doe" }]'],
			["posts/1.md", "# First Post\n\nThis is the first post."],
			["posts/2.md", "# Second Post\n\nThis is the second post."]
		])
	})

	await db.connect()

	console.info("Connected to MemoryDB with predefined files.\n")

	console.info("Listing directory 'posts/':")
	const entries = await db.listDir("posts/")
	for (const entry of entries) {
		console.info(`  ${entry.name}`)
	}

	console.info("\nLoading document 'users.json':")
	const usersContent = await db.loadDocument("users.json")
	console.info(`  Content: ${usersContent}`)

	console.info("\nEnsuring access logs:")
	console.info(`  Logs: ${JSON.stringify(db.accessLogs, null, 2)}`)

	console.success("Memory DB demo complete! 💾")
}

async function runDocsParserDemo() {
	console.clear()
	console.success("Docs Parser Demo")

	const parser = new DocsParser()
	const exampleFunction = () => {
		/**
		 * @docs
		 * # Documentation Title
		 *
		 * This is an example of how DocsParser extracts documentation.
		 *
		 * ## Example Section
		 *
		 * How to initialize DocsParser?
		 * ```js
		 * const parser = new DocsParser()
		 * ```
		 *
		 * How to use it with a function?
		 * ```js
		 * const node = parser.decode(exampleFunction)
		 * String(node) // ← Markdown document
		 * ```
		 */
	}

	const node = parser.decode(exampleFunction)
	console.info("Extracted documentation from function:\n")
	console.info(String(node))

	console.success("Docs parser demo complete! 📄")
}

async function runDatasetParserDemo() {
	console.clear()
	console.success("Dataset Parser Demo")

	const markdownText = `
# Package Name

## Installation

How to install with npm?
\`\`\`bash
npm install package-name
\`\`\`

## API

### \`createFn(options)\`

Creates a function with the given options.

* **Parameters**
  * \`options\` – Configuration settings.

How to use createFn?
\`\`\`js
const fn = createFn({ option: true })
assert.ok(fn)
\`\`\`
`

	const dataset = DatasetParser.parse(markdownText, "package-name")

	console.info("Generated dataset from markdown:\n")
	console.info(JSON.stringify(dataset, null, 2))

	console.success("Dataset parser demo complete! 🧪")
}

async function runSpawnDemo() {
	console.clear()
	console.success("Run Spawn Demo")

	console.info("Running 'echo Hello universe':\n")
	const result = await runSpawn("echo", ["Hello universe"])

	console.info(`Exit code: ${result.code}`)
	console.info(`Output: ${result.text}`)

	console.success("Run spawn demo complete! 🧑‍💻")
}

async function showMenu() {
	console.info("\n" + "=".repeat(50))
	console.info("Demo completed. Returning to menu...")
	console.info("=".repeat(50) + "\n")
}

async function main() {
	while (true) {
		try {
			const demoType = await chooseDemo()

			switch (demoType) {
				case "fetch":
					await runFetchDemo()
					break
				case "db":
					await runDbDemo()
					break
				case "docs":
					await runDocsParserDemo()
					break
				case "dataset":
					await runDatasetParserDemo()
					break
				case "spawn":
					await runSpawnDemo()
					break
				case "exit":
					process.exit(0)
					break
				default:
					console.warn("Unknown demo type selected")
			}

			await showMenu()
		} catch (error) {
			if (error.message && error.message.includes("cancel")) {
				console.warn("\nDemo selection cancelled. Returning to menu...")
				await showMenu()
			} else {
				throw error
			}
		}
	}
}

main().catch(err => {
	console.error("Error running playground:", err)
	process.exit(1)
})
