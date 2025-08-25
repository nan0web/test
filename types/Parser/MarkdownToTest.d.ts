export default MarkdownToTest;
/**
 * MarkdownToTest - generates node:test code from markdown release notes
 * Enables writing release notes first, then generating executable tests
 */
declare class MarkdownToTest {
    /**
     * Convert markdown release notes to node:test code
     * @param {string} markdown - Release notes markdown content
     * @returns {string} Generated test code
     */
    generateTests(markdown: string): string;
    /**
     * Generate import statements for node:test
     * @returns {string} Import code
     */
    generateImports(): string;
    /**
     * Generate main describe block header
     * @param {string} version - Release version
     * @param {string} date - Release date
     * @returns {string} Describe header code
     */
    generateDescribeHeader(version: string, date: string): string;
    /**
     * Extract sections from markdown lines
     * @param {string[]} lines - Markdown lines
     * @returns {Array<{title: string, tasks: Array<{content: string, status: string, slug: string}>}>} Sections with tasks
     */
    extractSections(lines: string[]): Array<{
        title: string;
        tasks: Array<{
            content: string;
            status: string;
            slug: string;
        }>;
    }>;
    /**
     * Generate test code for sections and their tasks
     * @param {Array<{title: string, tasks: Array}>} sections - Sections with tasks
     * @returns {string} Generated test code
     */
    generateSectionTests(sections: Array<{
        title: string;
        tasks: any[];
    }>): string;
}
