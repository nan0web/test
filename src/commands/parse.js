import process from "node:process"
import FS from "@nan0web/db-fs"
import { Command, CommandMessage } from "@nan0web/co"
import { Enum } from "@nan0web/types"
import TapParser from "../Parser/TapParser.js"
import TestNode from "../Parser/TestNode.js"

class ParseCommandOptions {
	static ALIAS = {
		"f": "fail",
		"s": "skip",
		"d": "todo",
	}
	/** @type {boolean} */
	help = false
	/** @type {boolean} */
	fail = false
	/** @type {boolean} */
	skip = false
	/** @type {boolean} */
	todo = false
	/**
	 * Todo output format.
	 * One of txt, md, html.
	 * @type {string}
	 */
	format = "txt"
	constructor(input = {}) {
		for (const [from, to] of Object.entries(ParseCommandOptions.ALIAS)) {
			if (undefined !== input[from]) {
				input[to] = input[from]
			}
		}
		const {
			help = this.help,
			fail = this.fail,
			skip = this.skip,
			todo = this.todo,
			format = this.format,
		} = input
		this.help = Boolean(help)
		this.fail = Boolean(fail)
		this.skip = Boolean(skip)
		this.todo = Boolean(todo)
		this.format = Enum("txt", "md", "html")(format)
	}
	/**
	 * @param {*} input
	 * @returns {ParseCommandOptions}
	 */
	static from(input) {
		if (input instanceof ParseCommandOptions) return input
		return new ParseCommandOptions(input)
	}
}

/**
 * @extends {CommandMessage}
 */
export class ParseCommandMessage extends CommandMessage {
	/** @type {ParseCommandOptions} */
	_opts = new ParseCommandOptions()
	constructor(input = {}) {
		const {
			body,
			name,
			argv = [],
			opts = {},
			children = [],
		} = input
		super({ body, name, argv, opts, children })
		this.opts = opts
	}
	/** @returns {ParseCommandOptions} */
	get opts() {
		return this._opts
	}
	/** @param {ParseCommandOptions} value */
	set opts(value) {
		this._opts = ParseCommandOptions.from(value)
	}
	/**
	 * @param {any} msg
	 */
	add(msg) {
		this.children.push(ParseCommandMessage.from(msg))
	}
}

/**
 * @extends {Command}
 */
export default class ParseCommand extends Command {
	static Message = ParseCommandMessage
	constructor() {
		super({
			name: "parse",
			help: "Parse the output of the tap output, filter and print in the specific format",
		})
		this.addOption("fail", Boolean, false, "Show failed tests only")
		this.addOption("skip", Boolean, false, "Show skipped tests only")
		this.addOption("todo", Boolean, false, "Show todo tests only")
		this.addOption("format", String, "txt", "Output format, one of: txt, md")
	}

	/**
	 * Possible arguments:
	 * --fail
	 * --skip
	 * --todo
	 * --format {md|txt}
	 * @param {ParseCommandMessage} msg
	 */
	async run(msg) {
		const input = await this.readInput()
		const parser = new TapParser()
		const result = parser.decode(input)
		const opts = msg.opts

		// let output = result.toString()
		/** @type {TestNode} */
		let root = result

		if (opts.fail || opts.skip || opts.todo) {
			root = new TestNode({
				children: result.filter(
					node => node.isFooter || opts.fail && node.isFail
						|| opts.skip && node.isSkip || opts.todo && node.isTodo
					, true)
			})
		}

		let output = ""

		switch (opts.format) {
			case "md":
				output = this.toMarkdown(root.toString())
				break
			case "html":
				output = this.toHTML(root.toString())
				break
			case "txt":
				output = root.toString({ tab: "  " })
				// @todo colorize the output:
				// red for the name of the test startsWith "not ok "
				// yellow for the +
			default:
				break
		}

		process.stdout.write(output + "\n")
	}

	async readInput() {
		return new Promise((resolve) => {
			let input = ""
			process.stdin.setEncoding("utf8")
			process.stdin.on("readable", () => {
				let chunk
				while (null !== (chunk = process.stdin.read())) {
					input += chunk
				}
			})
			process.stdin.on("end", () => {
				resolve(input)
			})
		})
	}

	toMarkdown(output) {
		return "```txt\n" + output + "\n```"
	}

	toHTML(output) {
		return "<pre>" + output.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</pre>"
	}
}
