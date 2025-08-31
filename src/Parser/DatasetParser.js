import Markdown, { MDHeading, MDParagraph, MDCodeBlock } from "@nan0web/markdown"

/**
 * DatasetParser is a utility class that converts markdown documentation into structured dataset entries.
 * Each entry includes context information, instructions, and outputs for training or demonstration purposes.
 */
export default class DatasetParser {
	/**
	 * Parses markdown text into structured dataset entries.
	 * @param {string} text - The markdown documentation to parse.
	 * @param {string} pkgName - The name of the package being documented.
	 * @returns {Array<Object>} Structured dataset entries with instruction, output, context, input, tags, and proven.
	 *
	 * @example
	 * ```js
	 * import DatasetParser from './DatasetParser.js'
	 * const dataset = DatasetParser.parse("# Package\n\nHow to use? \n```js\nexample\n```", "package-name")
	 * console.log(dataset)
	 * // [{ instruction: "How to use?", output: "```js\nexample\n```", ... }]
	 * ```
	 */
	static parse(text, pkgName) {
		const md = new Markdown()
		md.parse(text)
		const dataset = md.document.map((el, i, arr) => {
			if (el instanceof MDParagraph && el.content.startsWith("How ") && el.content.includes("?")) {
				const next = arr[i + 1]
				if (next instanceof MDCodeBlock) {
					/** @type {MDHeading[]} */
					const contextElements = arr.slice(0, i).filter(el => el instanceof MDHeading).map(el => MDHeading.from(el))
					const contextMap = new Map()
					/** @type {MDHeading | null} */
					const recentEl = contextElements[contextElements.length - 1]
					const recent = MDHeading.from(recentEl ?? { mdTag: "###### " })
					contextElements.filter(el => el.heading <= recent.heading).map(el => contextMap.set(el.tag, `h${el.heading}:${el.content}`))
					const context = Array.from(contextMap.values())
					let contextStart = contextElements.length > 0
						? contextElements[contextElements.length - 1]
						: 0
					if ("number" !== typeof contextStart) {
						contextStart = arr.findIndex(el => el === contextStart)
					}
					const input = arr.slice(contextStart, i)
						.filter(el => !(el instanceof MDCodeBlock || (el instanceof MDParagraph && el.content.startsWith("How "))))
						.map(String).join("\n").replace(/\n{3,}/g, '\n\n')
					const tags = context
						.map(c => c.replace(/^[^:]+:/, '')) // remove h*:
						.map(t => t.replace(/`/g, '')) || []
					return {
						instruction: el.content,
						output: String(next),
						context,
						input,
						tags,
						proven: `assert-in-${pkgName}`
					}
				}
			}
			return false
		}).filter(el => false !== el)

		return dataset
	}
}
