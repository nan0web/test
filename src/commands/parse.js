import process from "node:process"
import { Message, OutputMessage } from "@nan0web/co"
import { CLI } from "@nan0web/ui-cli"
import TapParser from "../Parser/TapParser.js"
import TestNode from "../Parser/TestNode.js"

class ParseBody {
	static help = {
		help: "Show help"
	}
	/** @type {boolean} */
	help = false
	static fail = {
		help: "Filter only failed tests",
		alias: "f"
	}
	/** @type {boolean} */
	fail = false
	static skip = {
		help: "Filter only skipped tests",
		alias: "s"
	}
	/** @type {boolean} */
	skip = false
	static todo = {
		help: "Filter only todo tests",
		alias: "d"
	}
	/** @type {boolean} */
	todo = false
	static format = {
		help: "Output format: txt, md, html",
		options: ["txt", "md", "html"],
		defaultValue: "txt"
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
			fail = this.fail,
			skip = this.skip,
			todo = this.todo,
			format = this.format,
		} = Message.parseBody(input, ParseBody)
		this.help = Boolean(help)
		this.fail = Boolean(fail)
		this.skip = Boolean(skip)
		this.todo = Boolean(todo)
		this.format = String(format)
	}
}

/**
 * @extends {Message}
 */
export class ParseMessage extends Message {
	static Body = ParseBody
	/** @type {ParseBody} */
	body
	constructor(input = {}) {
		super(input)
		this.body = new ParseBody(input.body ?? {})
	}
	/**
	 * @param {any} input
	 * @returns {ParseMessage}
	 */
	static from(input) {
		if (input instanceof ParseMessage) return input
		return new ParseMessage(input)
	}
}

/**
 * @extends {CLI}
 */
export default class ParseCommand extends CLI {
	static Message = ParseMessage

	write(str) {
		process.stdout.write(str)
	}

	/**
	 * Possible arguments:
	 * --fail
	 * --skip
	 * --todo
	 * --format {md|txt}
	 * @param {ParseMessage} msg
	 * @returns {AsyncGenerator<OutputMessage>}
	 */
	async * run(msg) {
		const input = await this.readInput()
		const parser = new TapParser()
		const result = parser.decode(input)
		const opts = msg.body

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
				// @todo colorize the output if not TTY:
				// red for the name of the test startsWith "not ok "
				// yellow for the +
			default:
				break
		}
		yield new OutputMessage(output)
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
