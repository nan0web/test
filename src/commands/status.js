import process from "node:process"
import FS from "@nan0web/db-fs"
import { CLI } from "@nan0web/ui-cli"
import ReactTestPackage from "../ReactTestPackage.js"
import TestPackage from "../TestPackage.js"
import RRS from "../RRS.js"
import Message, { OutputMessage } from "@nan0web/co"

export class ProgressMessage extends OutputMessage {}

class StatusBody {
	/** @type {boolean} */
	help = false
	static hide_name = {
		alias: "hide-name",
		help: "Hide name column",
	}
	/** @type {boolean} */
	hide_name = false
	static hide_status = {
		alias: "hide-status",
		help: "Hide status column",
	}
	/** @type {boolean} */
	hide_status = false
	static hide_docs = {
		alias: "hide-docs",
		help: "Hide docs column",
	}
	/** @type {boolean} */
	hide_docs = false
	static hide_coverage = {
		alias: "hide-coverage",
		help: "Hide coverage column",
	}
	/** @type {boolean} */
	hide_coverage = false
	static hide_features = {
		alias: "hide-features",
		help: "Hide features column",
	}
	/** @type {boolean} */
	hide_features = false
	static hide_npm = {
		alias: "hide-npm",
		help: "Hide npm column",
	}
	/** @type {boolean} */
	hide_npm = false
	static todo = {
		help: "Prints todo list",
	}
	/** @type {boolean} */
	todo = false
	static format = {
		help: "Todo list output format, one of: txt, md",
		options: ["txt", "md", "html"],
		defaultValue: "txt",
	}
	/**
	 * Todo output format.
	 * One of txt, md, html.
	 * @type {string}
	 */
	format = "txt"
	constructor(input = {}) {
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
		} = Message.parseBody(input, StatusBody)
		this.help = Boolean(help)
		this.hide_name = Boolean(hide_name)
		this.hide_status = Boolean(hide_status)
		this.hide_docs = Boolean(hide_docs)
		this.hide_coverage = Boolean(hide_coverage)
		this.hide_features = Boolean(hide_features)
		this.hide_npm = Boolean(hide_npm)
		this.todo = Boolean(todo)
		this.format = String(format)
	}
	/**
	 * @param {*} input
	 * @returns {StatusBody}
	 */
	static from(input) {
		if (input instanceof StatusBody) return input
		return new StatusBody(input)
	}
}

/**
 * @extends {Message}
 */
export class Status extends Message {
	static name = "status"
	static help = "Show package status including tests, coverage, docs, and release info"
	static Body = StatusBody
	/** @type {StatusBody} */
	body
	constructor(input) {
		super(input)
		this.body = new StatusBody(input.body ?? {})
	}
}

/**
 * @extends {CLI}
 */
export default class StatusCommand extends CLI {
	static Message = Status
	constructor(input = {}) {
		super({ ...input })
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
	 * @param {Status} msg
	 * @returns {AsyncGenerator<OutputMessage>}
	 */
	async * run(msg) {
		const db = new FS()
		const pkgJson = await db.loadDocument("package.json", {})
		const { name, repository } = pkgJson

		let baseURL = `https://github.com/${name.replace("@", "")}/`

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
		yield new OutputMessage(progress.join(" "))

		for await (const msg of pkg.run(rrs)) {
			progress.push(String(msg.value).trim())
			yield new ProgressMessage(this.logger.cut(progress.filter(Boolean).join(" ") + " > " + msg.name))
		}
		progress.push("= " + rrs.icon(""))
		yield new ProgressMessage(progress.filter(Boolean).join(" "))

		const print = (text, value) => {
			return text + " ".repeat(Math.abs(27 - text.length)) + value
		}

		yield new OutputMessage("\n--- Required ---\n")
		yield new OutputMessage(print("Git repository", rrs.required.git ? "✅ OK" : "✖️ fail"))
		yield new OutputMessage(print("Types d.ts no warnings", rrs.required.buildPass ? "✅ OK" : "✖️ fail"))
		yield new OutputMessage(print("Present system.md", rrs.required.systemMd ? "✅ OK" : "✖️ fail"))
		yield new OutputMessage(print("All tests passed", rrs.required.testPass ? "✅ OK" : "✖️ fail"))
		yield new OutputMessage(print("Present tsconfig.json", rrs.required.tsconfig ? "✅ OK" : "✖️ fail"))
		yield new OutputMessage("\n--- Optional ---\n")
		yield new OutputMessage(print("Contributing & License", rrs.optional.contributingAndLicense ? "✅ OK" : "   -"))
		yield new OutputMessage(print("NPM published", rrs.optional.npmPublished ? "✅ " + rrs.npmInfo : "   -"))
		yield new OutputMessage(print("Present playground", rrs.optional.playground ? "✅ OK" : "   -"))
		yield new OutputMessage(print("Present README.md", rrs.optional.readmeMd ? "✅ OK" : "   -"))
		yield new OutputMessage(print("Present README.md.js", rrs.optional.readmeTest ? "✅ OK" : "   -"))
		yield new OutputMessage(print("Present release.md", rrs.optional.releaseMd ? "✅ OK" : "   -"))
		yield new OutputMessage(print("Test coverage", rrs.coverage("")))

		const features = []
		if (rrs.required.buildPass) features.push("✅ d.ts")
		if (rrs.required.systemMd) features.push("📜 system.md")
		if (rrs.optional.playground) features.push("🕹️ playground")

		const cols = Object.keys(TestPackage.COLUMNS).filter(c => !msg.body["hide_" + c])

		const md = await db.loadDocument("README.md")
		if (md.includes("<!-- %PACKAGE_STATUS% -->")) {
			const table = pkg.render(rrs, { head: true, body: true, cols, features })
			const text = md
				.replaceAll("<!-- %PACKAGE_STATUS% -->", table)
				.replaceAll("$pkgURL/", pkg.baseURL)
				.replaceAll("$pkgURL", pkg.baseURL)
			await db.saveDocument("README.md", text)
		}

		if (msg.body.todo) {
			const md = pkg.toMarkdown(rrs)
			if ("html" === msg.body.format) {
				yield new OutputMessage("OUTPUT.html:\n" + md.toHTML())
			}
			else if ("md" === msg.body.format) {
				yield new OutputMessage("OUTPUT.md:\n" + String(md))
			}
			else {
				yield new OutputMessage("OUTPUT.txt:\n" + md.toArray().join(""))
			}
		}
	}
}
