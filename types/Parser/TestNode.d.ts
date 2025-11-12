/**
 * TestNode extends the base Node class to provide TAP-specific parsing functionality.
 * It adds getters for common TAP metadata like version, test counts, and duration.
 */
export default class TestNode extends Node {
    static HEADER: {
        version: string;
    };
    static FOOTER: {
        tests: string[];
        suites: string[];
        pass: string[];
        fail: string[];
        cancelled: string[];
        skipped: string[];
        todo: string[];
        duration: string[];
    };
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
     * @param {number} [input.indent=0] - Content of the node.
     * @param {TestNode} [input.parent=null] - Parent node.
     */
    constructor(input?: {
        children?: TestNode[] | undefined;
        content?: string | undefined;
        indent?: number | undefined;
        parent?: TestNode | undefined;
    });
    /** @type {TestNode[]} */
    children: TestNode[];
    parent: any;
    get HEADER(): {
        version: string;
    };
    get FOOTER(): {
        tests: string[];
        suites: string[];
        pass: string[];
        fail: string[];
        cancelled: string[];
        skipped: string[];
        todo: string[];
        duration: string[];
    };
    /**
     * Find a child node whose content starts with the given prefix and return the
     * remaining part of the content after the prefix.
     * @param {string | string[]} prefix - The prefix to search for in child node contents.
     * @returns {string} The substring after the prefix, or an empty string if not found.
     */
    findPrefix(prefix: string | string[]): string;
    /**
     * Finds an element by filter.
     *
     * @param {(v:any)=>boolean} filter
     * @param {boolean} [recursively=false]
     * @returns {TestNode | null}
     */
    find(filter: (v: any) => boolean, recursively?: boolean | undefined): TestNode | null;
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
    get skipCount(): number;
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
    /** @returns {boolean} */
    get isFail(): boolean;
    /** @returns {boolean} */
    get isSkip(): boolean;
    /** @returns {boolean} */
    get isTodo(): boolean;
    /** @returns {boolean} */
    get isFooter(): boolean;
    /**
     * Adds element to the container.
     * @param {TestNode} element
     * @returns {this}
     */
    add(element: TestNode): this;
    /**
     * Flattens the tree into an array.
     *
     * @returns {TestNode[]}
     */
    flat(): TestNode[];
    /**
     * @returns {TestNode[]}
     */
    toArray(): TestNode[];
    /**
     * Filters children.
     *
     * @param {(v: TestNode) => boolean} [filter=()=>true]
     * @param {boolean} [recursively=false]
     * @returns {TestNode[]}
     */
    filter(filter?: ((v: TestNode) => boolean) | undefined, recursively?: boolean | undefined): TestNode[];
}
import { Node } from "@nan0web/types";
