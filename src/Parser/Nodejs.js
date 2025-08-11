import { Parser, Node } from "@nan0web/types"

class NodejsParser extends Parser {
	/**
	 * Decode the Node.js test output text into a tree.
	 * @param {string} text
	 * @returns {Node}
	 */
	decode(text) {
		const rows = String(text).split(this.eol)
		const root = new Node()
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
			const node = new Node({ content: payload })
			parent.children.push(node)

			// Push it onto the stack – it may own children
			stack.push({ node, indent })
		}

		return root
	}

	/**
	 * Encode the tree back into Node.js test output text.
	 * @param {Node} node
	 * @param {object} options
	 * @param {number} [options.indent=-1]
	 * @param {Node} [options.parent=null]
	 * @returns {string}
	 */
	encode(node, options = {}) {
		const { indent = -1, parent = null } = options
		const line = `${this.tab.repeat(Math.max(0, indent))}${node.content}`
		if (!node.children || node.children.length === 0) {
			return line
		}
		const childLines = node.children
			.map(child => this.encode(child, { indent: indent + 1, parent: node }))
			.join(this.eol)
		const result = `${line}${this.eol}${childLines}`
		return indent < 0 && !parent ? result.trim() : result
	}
}

export default NodejsParser
