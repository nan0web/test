import { Node } from "@nan0web/types"

/**
 * TestNode extends the base Node class to provide TAP-specific parsing functionality.
 * It adds getters for common TAP metadata like version, test counts, and duration.
 */
export default class TestNode extends Node {
	static HEADER = {
		version: "TAP version ",
	}
	static FOOTER = {
		tests: ["# tests ", "ℹ tests "],
		suites: ["# suites ", "ℹ suites"],
		pass: ["# pass ", "ℹ pass"],
		fail: ["# fail ", "ℹ fail"],
		cancelled: ["# cancelled ", "ℹ cancelled"],
		skipped: ["# skipped ", "ℹ skipped"],
		todo: ["# todo ", "ℹ todo"],
		duration: ["# duration_ms ", "ℹ duration_ms"],
	}
	/** @type {TestNode[]} */
	children = []

	/**
	 * Create a new TestNode instance.
	 * @param {object} input - The input object to initialize the node.
	 * @param {TestNode[]} [input.children=[]] - Array of child nodes.
	 * @param {string} [input.content=""] - Content of the node.
	 * @param {number} [input.indent=0] - Content of the node.
	 * @param {TestNode} [input.parent=null] - Parent node.
	 */
	constructor(input = {}) {
		super(input)
		const {
			children = [],
			parent = null
		} = input
		this.children = children.map(c => TestNode.from(c))
		this.parent = parent
	}

	get HEADER() {
		return /** @type {typeof TestNode} */ (this.constructor).HEADER
	}

	get FOOTER() {
		return /** @type {typeof TestNode} */ (this.constructor).FOOTER
	}

	/**
	 * Find a child node whose content starts with the given prefix and return the
	 * remaining part of the content after the prefix.
	 * @param {string | string[]} prefix - The prefix to search for in child node contents.
	 * @returns {string} The substring after the prefix, or an empty string if not found.
	 */
	findPrefix(prefix) {
		const prefixes = Array.isArray(prefix) ? prefix : [prefix]
		for (const p of prefixes) {
			const v = this.find(c => c.content.startsWith(p))
			if (v) {
				return v.content.slice(p.length)
			}
		}
		return ""
	}

	/**
	 * Finds an element by filter.
	 *
	 * @param {(v:any)=>boolean} filter
	 * @param {boolean} [recursively=false]
	 * @returns {TestNode | null}
	 */
	find(filter, recursively) {
		const result = super.find(filter, recursively)
		return result ? TestNode.from(result) : null
	}

	/**
	 * Get the TAP version from the test output.
	 * @type {number}
	 */
	get version() {
		return Number(this.findPrefix(this.HEADER.version) || 0)
	}

	/**
	 * Get the total number of tests from the test output.
	 * @type {number}
	 */
	get testsCount() {
		return Number(this.findPrefix(this.FOOTER.tests) || 0)
	}

	/**
	 * Get the total number of test suites from the test output.
	 * @type {number}
	 */
	get suitesCount() {
		return Number(this.findPrefix(this.FOOTER.suites) || 0)
	}

	/**
	 * Get the number of passed tests from the test output.
	 * @type {number}
	 */
	get passCount() {
		return Number(this.findPrefix(this.FOOTER.pass) || 0)
	}

	/**
	 * Get the number of failed tests from the test output.
	 * @type {number}
	 */
	get failCount() {
		return Number(this.findPrefix(this.FOOTER.fail) || 0)
	}

	/**
	 * Get the number of cancelled tests from the test output.
	 * @type {number}
	 */
	get cancelledCount() {
		return Number(this.findPrefix(this.FOOTER.cancelled) || 0)
	}

	/**
	 * Get the number of skipped tests from the test output.
	 * @type {number}
	 */
	get skipCount() {
		return Number(this.findPrefix(this.FOOTER.skipped) || 0)
	}

	/**
	 * Get the number of todo tests from the test output.
	 * @type {number}
	 */
	get todoCount() {
		return Number(this.findPrefix(this.FOOTER.todo) || 0)
	}

	/**
	 * Get the test duration in milliseconds from the test output.
	 * @type {number}
	 */
	get durationMs() {
		const ms = this.findPrefix(this.FOOTER.duration)
		if (!ms) return 0
		if ("string" === typeof ms) {
			return Number(parseFloat(ms.replace(/[^\d+\.]/g, "")))
		}
		return Number(ms)
	}

	/**
	 * Get the test duration in seconds from the test output.
	 * @type {number}
	 */
	get duration() {
		return this.durationMs / 1_000
	}

	/** @returns {boolean} */
	get isFail() {
		if (this.isSkip || this.isTodo) return false
		return this.content.startsWith("not ok ") || this.content.startsWith("✖ ")
	}

	/** @returns {boolean} */
	get isSkip() {
		return this.content.endsWith("# SKIP")
	}

	/** @returns {boolean} */
	get isTodo() {
		return this.content.endsWith("# TODO")
	}

	/** @returns {boolean} */
	get isFooter() {
		if (this.children.length > 0) return false

		return Object.values(this.FOOTER).some(
			pre => (Array.isArray(pre) ? pre : [pre]).some(
				prefix => this.content.startsWith(prefix)
			)
		)
	}

	/**
	 * Adds element to the container.
	 * @param {any} element
	 * @returns {this}
	 */
	add(element) {
		const node = TestNode.from(super.add(element))
		element._updateLevel()
		return /** @type {this} */ (node)
	}
	/**
	 * Flattens the tree into an array.
	 *
	 * @returns {TestNode[]}
	 */
	flat() {
		return super.flat().map(n => TestNode.from(n))
	}
	/**
	 * @returns {TestNode[]}
	 */
	toArray() {
		return super.toArray().map(n => TestNode.from(n))
	}
	/**
	 * Filters children.
	 *
	 * @param {(v: TestNode) => boolean} [filter=()=>true]
	 * @param {boolean} [recursively=false]
	 * @returns {TestNode[]}
	 */
	filter(filter, recursively) {
		return super.filter(filter, recursively).map(n => TestNode.from(n))
	}

	/**
	 * Create a TestNode from input data.
	 * @param {object} input - The input data to create a TestNode from.
	 * @returns {TestNode} The created TestNode instance.
	 */
	static from(input) {
		if (input instanceof TestNode) return input
		return new TestNode(input)
	}
}
