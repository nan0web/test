import { Parser, Node } from "@nan0web/types"

class DocsParser extends Parser {
	static SKIP = []
	stops = [
		"/** @docs */",
		"assert.",
	]
	#insideComment = false
	#insideDocs = false
	/** @type {Array<{ row: string, indent: number }>} */
	#rows = []
	/**
	 * @param {object} input
	 * @param {string} [input.eol="\n"]
	 * @param {string} [input.tab="  "]
	 * @param {Array<string | Function>} [input.skip=[]]
	 */
	constructor(input = {}) {
		const {
			skip = DocsParser.SKIP,
		} = input
		super({ ...input, skip })
	}
	/**
	 * @param {Function | string} text
	 * @returns {Node}
	 */
	decode(text) {
		if ("function" === typeof text) {
			// Extract the source code of the function
			text = text.toString()
		}
		const tab = this.tab
		this.tab = Parser.findTab(text) || this.tab
		this.#insideComment = false
		this.#insideDocs = false
		this.#rows = []
		const result = []
		const node = super.decode(text)
		let insideFn = false
		let parentIndent = 0
		this.#rows.map(({ row, indent }, i) => {
			let prefix = insideFn ? this.tab.repeat(Math.max(0, indent - parentIndent)) : ""
			/** @type {string | false} */
			let value = row.trim()
			if (row.startsWith(" * ")) {
				value = row.slice(3)
			}
			else if ([" *", " */"].includes(row)) {
				value = ""
			}
			else if (["it('", 'it("', "it(`"].some(s => row.startsWith(s))) {
				value = row.slice(4, row.indexOf(row[3], 4)) + "\n```js"
				parentIndent = indent + 1
				insideFn = true
			}
			else if (row.startsWith("// ")) {
				if (insideFn) {
					// value = value.slice(3)
				}
			}
			else if (row.startsWith("//")) {
				value = row.slice(2)
			}
			else if (this.stops.some(s => row.startsWith(s))) {
				value = insideFn ? "```" : false
				prefix = ""
				insideFn = false
			}
			else if (insideFn && value.startsWith("/**")) {
				const next = this.#rows[i + 1] || ""
				if (next.row.startsWith(" * ```")) {
					const prev = String(result[result.length - 1] || "")
					if (prev.endsWith("\n```js")) {
						result[result.length - 1] = prev.slice(0, -6)
						value = false
						insideFn = false
					}
				}
			}
			result.push(false === value ? value : prefix + value)
		})
		this.tab = tab
		const content = result.filter(r => false !== r).join("\n").replaceAll("\n```js\n```", "\n").replace(/\n\`\`\`js$/, "\n")
		return new Node({ content })
	}
	/**
	 * Parsing comments properly by detecting the another indent count inside the comment
	 * Indentation calculator.
	 * Returns how many *tab‑units* (default two spaces) the line starts with.
	 * @param {string} str
	 * @param {string[]} [prevRows=[]]
	 * @returns {number}
	 */
	readIndent(str, prevRows = []) {
		let indent = super.readIndent(str, prevRows) || 0
		const row = str.slice(this.tab.repeat(indent).length)
		const value = row.trim()
		if (value.startsWith("/**") && !this.#insideComment) {
			this.#insideComment = true
			++indent
		}
		if (value.endsWith("*/") && this.#insideComment) {
			this.#insideComment = false
			--indent
		}
		if (this.#insideDocs) {
			this.#rows.push({ row, indent })
		}
		if (this.stops.some(s => value.startsWith(s))) {
			this.#insideDocs = false
		}
		if (value.startsWith("* @docs")) {
			this.#insideDocs = true
		}
		return indent
	}
}

export default DocsParser
