export default ReleaseParser;
/**
 * ReleaseParser - parses test results into structured release notes format
 * Extracts test descriptions and groups them by suite/test structure
 * Generates markdown output matching release.md specification
 */
declare class ReleaseParser {
    /**
     * @param {Object} options
     * @param {string} [options.eol="\n"] - End of line character
     * @param {string} [options.tab="\t"] - Tab character for indentation
     */
    constructor(options?: {
        eol?: string | undefined;
        tab?: string | undefined;
    });
    eol: string;
    tab: string;
    /**
     * Parse TAP output into release notes markdown
     * @param {string|TestNode} input - TAP formatted text or parsed TestNode
     * @param {object} context - Parsing context
     * @param {string} [context.version] - Release version
     * @param {string} [context.date] - Release date
     * @returns {string} Generated release notes markdown
     */
    parse(input: string | TestNode, context?: {
        version?: string | undefined;
        date?: string | undefined;
    }): string;
    /**
     * Generate markdown from TestNode structure
     * @param {TestNode} node - Root test node
     * @returns {string} Release notes markdown
     */
    generateMarkdown(node: TestNode): string;
    /**
     * Process test suites into markdown sections
     * @param {TestNode[]} suites - Array of test suite nodes
     * @returns {string} Markdown content
     */
    processSuites(suites: TestNode[]): string;
    /**
     * Process individual tests into task items
     * @param {TestNode[]} tests - Array of test nodes
     * @returns {string} Markdown list of tasks
     */
    processTasks(tests: TestNode[]): string;
    /**
     * Generate slug from task title
     * @param {string} title - Task title
     * @returns {string} Generated slug
     */
    generateSlug(title: string): string;
}
import TestNode from "./Node.js";
