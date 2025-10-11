import { Parser } from "@nan0web/types"
import TestNode from "./TestNode.js"

/**
 * A parser for Node.js test output in TAP format.
 * Handles decoding TAP text into a tree structure and encoding it back to text.
 */
export default class TapParser extends Parser {
	/**
	 * Decode the Node.js test output text into a tree.
	 * @param {string} text - The TAP-formatted text to decode.
	 * @returns {TestNode} A tree structure representing the test output.
	 */
	decode(text) {
		const rows = String(text).split(this.eol)
		const root = new TestNode()
		const stack = [{ node: root, indent: -1 }]

		for (let i = 0; i < rows.length; i++) {
			const raw = rows[i]
			// skip completely empty lines
			if (!raw.trim()) continue

			const indent = this.readIndent(raw)
			const payload = raw.slice(indent * this.tab.length).trimEnd()

			// Find correct parent by popping deeper frames
			while (stack.length && indent <= stack[stack.length - 1].indent) {
				stack.pop()
			}
			const parent = stack[stack.length - 1].node

			// Create a new node with payload
			const node = new TestNode({ content: payload, indent, parent })
			parent.children.push(node)

			// Push it onto the stack – it may own children
			stack.push({ node, indent })
		}

		return root
	}

	/**
	 * Encode the tree back into Node.js test output text.
	 * @param {TestNode} node - The node tree to encode.
	 * @param {object} options - Encoding options.
	 * @param {number} [options.indent=0] - The indentation level for the node.
	 * @param {TestNode} [options.parent=null] - The parent node.
	 * @returns {string} The TAP-formatted text representation of the tree.
	 */
	encode(node, options = {}) {
		const { indent = 0, parent = null } = options

		// Handle root node specially - it should not add indentation
		if (!parent && node.children) {
			return node.children.map(child => this.encode(child, { indent: indent, parent: node })).join("")
		}

		const line = `${this.tab.repeat(Math.max(0, indent))}${node.content}${this.eol}`

		if (!node.children || node.children.length === 0) {
			return line
		}

		const childLines = node.children.map(child => this.encode(child, { indent: indent + 1, parent: node })).join("")
		return line + childLines
	}
}
