/**
 * DatasetParser is a utility class that converts markdown documentation into structured dataset entries.
 * Each entry includes context information, instructions, and outputs for training or demonstration purposes.
 */
export default class DatasetParser {
    /**
     * Parses markdown text into structured dataset entries.
     * @param {string} text - The markdown documentation to parse.
     * @param {string} pkgName - The name of the package being documented.
     * @returns {Array<Object>} Structured dataset entries with instruction, output, context, input, tags, and proven.
     *
     * @example
     * ```js
     * import DatasetParser from './DatasetParser.js'
     * const dataset = DatasetParser.parse("# Package\n\nHow to use? \n```js\nexample\n```", "package-name")
     * console.log(dataset)
     * // [{ instruction: "How to use?", output: "```js\nexample\n```", ... }]
     * ```
     */
    static parse(text: string, pkgName: string): Array<any>;
}
