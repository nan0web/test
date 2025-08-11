export default TestNode;
/**
 * TestNode extends the base Node class to provide TAP-specific parsing functionality.
 * It adds getters for common TAP metadata like version, test counts, and duration.
 */
declare class TestNode extends Node {
    /**
     * Create a TestNode from input data.
     * @param {object} input - The input data to create a TestNode from.
     * @returns {TestNode} The created TestNode instance.
     */
    static from(input: object): TestNode;
    /**
     * Create a new TestNode instance.
     * @param {object} input - The input object to initialize the node.
     * @param {TestNode[]} [input.children=[]] - Array of child nodes.
     * @param {string} [input.content=""] - Content of the node.
     */
    constructor(input?: {
        children?: TestNode[] | undefined;
        content?: string | undefined;
    });
    /** @type {TestNode[]} */
    children: TestNode[];
    /**
     * Find a child node whose content starts with the given prefix and return the
     * remaining part of the content after the prefix.
     * @param {string} prefix - The prefix to search for in child node contents.
     * @returns {string} The substring after the prefix, or an empty string if not found.
     */
    findPrefix(prefix: string): string;
    /**
     * Get the TAP version from the test output.
     * @type {number}
     */
    get version(): number;
    /**
     * Get the total number of tests from the test output.
     * @type {number}
     */
    get testsCount(): number;
    /**
     * Get the total number of test suites from the test output.
     * @type {number}
     */
    get suitesCount(): number;
    /**
     * Get the number of passed tests from the test output.
     * @type {number}
     */
    get passCount(): number;
    /**
     * Get the number of failed tests from the test output.
     * @type {number}
     */
    get failCount(): number;
    /**
     * Get the number of cancelled tests from the test output.
     * @type {number}
     */
    get cancelledCount(): number;
    /**
     * Get the number of skipped tests from the test output.
     * @type {number}
     */
    get skippedCount(): number;
    /**
     * Get the number of todo tests from the test output.
     * @type {number}
     */
    get todoCount(): number;
    /**
     * Get the test duration in milliseconds from the test output.
     * @type {number}
     */
    get durationMs(): number;
    /**
     * Get the test duration in seconds from the test output.
     * @type {number}
     */
    get duration(): number;
}
import { Node } from "@nan0web/types";
