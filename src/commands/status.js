import process from "node:process"
import FS from "@nan0web/db-fs"
import { Command, CommandMessage } from "@nan0web/co"
import { Enum } from "@nan0web/types"
import ReactTestPackage from "../ReactTestPackage.js"
import TestPackage from "../TestPackage.js"
import RRS from "../RRS.js"

class StatusCommandOptions {
	static ALIAS = {
		"hide-name": "hide_name",
		"hide-status": "hide_status",
		"hide-docs": "hide_docs",
		"hide-coverage": "hide_coverage",
		"hide-features": "hide_features",
		"hide-npm": "hide_npm",
	}
	/** @type {boolean} */
	help = false
	/** @type {boolean} */
	hide_name = false
	/** @type {boolean} */
	hide_status = false
	/** @type {boolean} */
	hide_docs = false
	/** @type {boolean} */
	hide_coverage = false
	/** @type {boolean} */
	hide_features = false
	/** @type {boolean} */
	hide_npm = false
	/** @type {boolean} */
	todo = false
	/**
	 * Todo output format.
	 * One of txt, md, html.
	 * @type {string}
	 */
	format = "txt"
	constructor(input = {}) {
		for (const [from, to] of Object.entries(StatusCommandOptions.ALIAS)) {
			if (undefined !== input[from]) {
				input[to] = input[from]
			}
		}
		const {
			help = this.help,
			hide_name = this.hide_name,
			hide_status = this.hide_status,
			hide_docs = this.hide_docs,
			hide_coverage = this.hide_coverage,
			hide_features = this.hide_features,
			hide_npm = this.hide_npm,
			todo = this.todo,
			format = this.format,
		} = input
		this.help = Boolean(help)
		this.hide_name = Boolean(hide_name)
		this.hide_status = Boolean(hide_status)
		this.hide_docs = Boolean(hide_docs)
		this.hide_coverage = Boolean(hide_coverage)
		this.hide_features = Boolean(hide_features)
		this.hide_npm = Boolean(hide_npm)
		this.todo = Boolean(todo)
		this.format = Enum("txt", "md", "html")(format)
	}
	/**
	 * @param {*} input
	 * @returns {StatusCommandOptions}
	 */
	static from(input) {
		if (input instanceof StatusCommandOptions) return input
		return new StatusCommandOptions(input)
	}
}

/**
 * @extends {CommandMessage}
 */
export class StatusCommandMessage extends CommandMessage {
	/** @type {StatusCommandOptions} */
	opts
	constructor(input = {}) {
		const {
			body,
			name,
			args = [],
			opts = {},
			children = [],
		} = input
		super({ body, name, args, opts, children })
		this.opts = StatusCommandOptions.from(opts)
	}
	/**
	 * @param {any} msg
	 */
	add(msg) {
		this.children.push(StatusCommandMessage.from(msg))
	}
}

/**
 * @extends {Command}
 */
export default class StatusCommand extends Command {
	static Message = StatusCommandMessage
	constructor() {
		super({
			name: "status",
			help: "Show package status including tests, coverage, docs, and release info",
		})
		this.addOption("hide-name", Boolean, false, "Hide name column")
		this.addOption("hide-status", Boolean, false, "Hide status column")
		this.addOption("hide-docs", Boolean, false, "Hide docs column")
		this.addOption("hide-coverage", Boolean, false, "Hide coverage column")
		this.addOption("hide-features", Boolean, false, "Hide features column")
		this.addOption("hide-npm", Boolean, false, "Hide npm column")
		this.addOption("todo", Boolean, false, "Prints todo list")
		this.addOption("format", String, "txt", "Todo list output format, one of: txt, md")
	}

	/**
	 * Possible arguments:
	 * --hide-name
	 * --hide-status
	 * --hide-docs
	 * --hide-coverage
	 * --hide-features
	 * --hide-npm
	 * --todo
	 * --format {md|txt}
	 * @param {StatusCommandMessage} msg
	 */
	async run(msg) {
		const db = new FS()
		const pkgJson = await db.loadDocument("package.json", {})
		const { name, repository } = pkgJson

		let baseURL = `https://github.com/nan0web/${name}/`

		if (repository) {
			baseURL = typeof repository === "string" ? repository : repository.url
			if (baseURL.startsWith("git+")) baseURL = baseURL.slice(4)
			if (baseURL.endsWith(".git")) baseURL = baseURL.slice(0, -4) + "/"
		}
		const Class = name.split("-").includes("react") ? ReactTestPackage : TestPackage
		const pkg = new Class({
			cwd: process.cwd(),
			db,
			name,
			baseURL,
		})

		const rrs = new RRS()
		const progress = [name]
		this.logger.info(progress.join(" "))

		for await (const msg of pkg.run(rrs)) {
			progress.push(String(msg.value).trim())
			this.logger.cursorUp(2, true)
			this.logger.info(progress.filter(Boolean).join(" "))
			this.logger.info(msg.name)
		}
		progress.push("= " + rrs.icon(""))
		this.logger.cursorUp(2, true)
		this.logger.info(progress.filter(Boolean).join(" "))

		const print = (text, value) => {
			this.logger.info(text + " ".repeat(Math.abs(27 - text.length)) + value)
		}

		this.logger.info("\n--- Required ---\n")
		print("Types d.ts no warnings", rrs.required.buildPass ? "✅ OK" : "✖️ fail")
		print("Present system.md", rrs.required.systemMd ? "✅ OK" : "✖️ fail")
		print("All tests passed", rrs.required.testPass ? "✅ OK" : "✖️ fail")
		print("Present tsconfig.json", rrs.required.tsconfig ? "✅ OK" : "✖️ fail")
		this.logger.info("\n--- Optional ---\n")
		print("Contributing & License", rrs.optional.contributingAndLicense ? "✅ OK" : "   -")
		print("NPM published", rrs.optional.npmPublished ? "✅ " + rrs.npmInfo : "   -")
		print("Present playground", rrs.optional.playground ? "✅ OK" : "   -")
		print("Present README.md", rrs.optional.readmeMd ? "✅ OK" : "   -")
		print("Present README.md.js", rrs.optional.readmeTest ? "✅ OK" : "   -")
		print("Present release.md", rrs.optional.releaseMd ? "✅ OK" : "   -")
		print("Test coverage", rrs.coverage(""))

		const features = []
		if (rrs.required.buildPass) features.push("✅ d.ts")
		if (rrs.required.systemMd) features.push("📜 system.md")
		if (rrs.optional.playground) features.push("🕹️ playground")

		const cols = Object.keys(TestPackage.COLUMNS).filter(c => !msg.opts["hide_" + c])

		const md = await db.loadDocument("README.md")
		if (md.includes("<!-- %PACKAGE_STATUS% -->")) {
			const table = pkg.render(rrs, { head: true, body: true, cols, features })
			await db.saveDocument("README.md", md.replaceAll("<!-- %PACKAGE_STATUS% -->", table))
		}

		if (msg.opts.todo) {
			const md = pkg.toMarkdown(rrs)
			if ("html" === msg.opts.format) {
				process.stdout.write("OUTPUT.html:\n" + md.toHTML())
			}
			else if ("md" === msg.opts.format) {
				process.stdout.write("OUTPUT.md:\n" + String(md))
			}
			else {
				process.stdout.write("OUTPUT.txt:\n" + md.toArray().join(""))
			}
		}
	}
}
