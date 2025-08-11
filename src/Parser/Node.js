import { Node } from "@nan0web/types";

/**
 * TestNode extends the base Node class to provide TAP-specific parsing functionality.
 * It adds getters for common TAP metadata like version, test counts, and duration.
 */
class TestNode extends Node {
	/** @type {TestNode[]} */
	children = []

	/**
	 * Create a new TestNode instance.
	 * @param {object} input - The input object to initialize the node.
	 * @param {TestNode[]} [input.children=[]] - Array of child nodes.
	 * @param {string} [input.content=""] - Content of the node.
	 */
	constructor(input = {}) {
		super(input)
		const {
			children = []
		} = input
		this.children = children.map(c => TestNode.from(c))
	}

	/**
	 * Find a child node whose content starts with the given prefix and return the
	 * remaining part of the content after the prefix.
	 * @param {string} prefix - The prefix to search for in child node contents.
	 * @returns {string} The substring after the prefix, or an empty string if not found.
	 */
	findPrefix(prefix) {
		const v = this.find(c => c.content.startsWith(prefix))
		return v ? v.content.slice(prefix.length) : ""
	}

	/**
	 * Get the TAP version from the test output.
	 * @type {number}
	 */
	get version() {
		return Number(this.findPrefix("TAP version ") || 0)
	}

	/**
	 * Get the total number of tests from the test output.
	 * @type {number}
	 */
	get testsCount() {
		return Number(this.findPrefix("# tests ") || 0)
	}

	/**
	 * Get the total number of test suites from the test output.
	 * @type {number}
	 */
	get suitesCount() {
		return Number(this.findPrefix("# suites ") || 0)
	}

	/**
	 * Get the number of passed tests from the test output.
	 * @type {number}
	 */
	get passCount() {
		return Number(this.findPrefix("# pass ") || 0)
	}

	/**
	 * Get the number of failed tests from the test output.
	 * @type {number}
	 */
	get failCount() {
		return Number(this.findPrefix("# fail ") || 0)
	}

	/**
	 * Get the number of cancelled tests from the test output.
	 * @type {number}
	 */
	get cancelledCount() {
		return Number(this.findPrefix("# cancelled ") || 0)
	}

	/**
	 * Get the number of skipped tests from the test output.
	 * @type {number}
	 */
	get skippedCount() {
		return Number(this.findPrefix("# skipped ") || 0)
	}

	/**
	 * Get the number of todo tests from the test output.
	 * @type {number}
	 */
	get todoCount() {
		return Number(this.findPrefix("# todo ") || 0)
	}

	/**
	 * Get the test duration in milliseconds from the test output.
	 * @type {number}
	 */
	get durationMs() {
		return Number(this.findPrefix("# duration_ms ") || 0)
	}

	/**
	 * Get the test duration in seconds from the test output.
	 * @type {number}
	 */
	get duration() {
		return this.durationMs / 1_000
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

export default TestNode
