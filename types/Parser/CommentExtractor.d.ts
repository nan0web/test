export default CommentExtractor;
/**
 * CommentExtractor - extracts comments from test files to preserve documentation
 * during release note generation
 */
declare class CommentExtractor {
    /**
     * Extract comments from test file content
     * @param {string} content - Test file content
     * @returns {string[]} Array of comment blocks
     */
    extractComments(content: string): string[];
    /**
     * Extract release header comment from test file
     * Looks for comments before the main describe block
     * @param {string} content - Test file content
     * @returns {string|null} Release header content or null
     */
    extractReleaseHeader(content: string): string | null;
}
