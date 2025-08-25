export default ReleaseHybridParser;
/**
 * ReleaseHybridParser - hybrid parser that combines TAP test results with
 * structured comments to generate complete release notes including assets,
 * diagrams, and other markdown elements
 */
declare class ReleaseHybridParser {
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
    commentExtractor: CommentExtractor;
    /**
     * Parse test file content into release notes markdown
     * Combines TAP output parsing with comment extraction
     * @param {string|TestNode} tapInput - TAP formatted text or parsed TestNode
     * @param {string} testFileContent - Original test file content with comments
     * @returns {string} Generated release notes markdown
     */
    parse(tapInput: string | TestNode, testFileContent: string): string;
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
import CommentExtractor from "./CommentExtractor.js";
import TestNode from "./Node.js";
