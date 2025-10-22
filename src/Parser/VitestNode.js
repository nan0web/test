import TestNode from "./TestNode.js"

/**
 * TestNode extends the base Node class to provide TAP-specific parsing functionality.
 * It adds getters for common TAP metadata like version, test counts, and duration.
 */
export default class VitestNode extends TestNode {
	static HEADER = {
		version: "RUN ",
	}
	/** @type {VitestNode[]} */
	children = []

	/**
	 * Create a new TestNode instance.
	 * @param {object} input - The input object to initialize the node.
	 * @param {VitestNode[]} [input.children=[]] - Array of child nodes.
	 * @param {string} [input.content=""] - Content of the node.
	 * @param {number} [input.indent=0] - Content of the node.
	 * @param {VitestNode} [input.parent=null] - Parent node.
	 */
	constructor(input = {}) {
		super(input)
		const {
			children = [],
			parent = null
		} = input
		this.children = children.map(c => VitestNode.from(c))
		this.parent = parent
	}

	get HEADER() {
		return /** @type {typeof VitestNode} */ (this.constructor).HEADER
	}

	get FOOTER() {
		return /** @type {typeof VitestNode} */ (this.constructor).FOOTER
	}

	/**
	 * Finds an element by filter.
	 *
	 * @param {(v:any)=>boolean} filter
	 * @param {boolean} [recursively=false]
	 * @returns {VitestNode | null}
	 */
	find(filter, recursively) {
		const result = super.find(filter, recursively)
		return result ? VitestNode.from(result) : null
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
		return this.content.startsWith("not ok ")
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
		return false
	}

	/**
	 * Adds element to the container.
	 * @param {any} element
	 * @returns {this}
	 */
	add(element) {
		const node = VitestNode.from(super.add(element))
		element._updateLevel()
		return /** @type {this} */ (node)
	}
	/**
	 * Flattens the tree into an array.
	 *
	 * @returns {VitestNode[]}
	 */
	flat() {
		return super.flat().map(n => VitestNode.from(n))
	}
	/**
	 * @returns {VitestNode[]}
	 */
	toArray() {
		return super.toArray().map(n => VitestNode.from(n))
	}
	/**
	 * Filters children.
	 *
	 * @param {(v: VitestNode) => boolean} [filter=()=>true]
	 * @param {boolean} [recursively=false]
	 * @returns {VitestNode[]}
	 */
	filter(filter, recursively) {
		return super.filter(filter, recursively).map(n => VitestNode.from(n))
	}

	/**
	 * Create a TestNode from input data.
	 * @param {object} input - The input data to create a TestNode from.
	 * @returns {VitestNode} The created TestNode instance.
	 */
	static from(input) {
		if (input instanceof VitestNode) return input
		return new VitestNode(input)
	}
}
