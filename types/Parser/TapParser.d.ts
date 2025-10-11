/**
 * A parser for Node.js test output in TAP format.
 * Handles decoding TAP text into a tree structure and encoding it back to text.
 */
export default class TapParser extends Parser {
    /**
     * Decode the Node.js test output text into a tree.
     * @param {string} text - The TAP-formatted text to decode.
     * @returns {TestNode} A tree structure representing the test output.
     */
    decode(text: string): TestNode;
    /**
     * Encode the tree back into Node.js test output text.
     * @param {TestNode} node - The node tree to encode.
     * @param {object} options - Encoding options.
     * @param {number} [options.indent=0] - The indentation level for the node.
     * @param {TestNode} [options.parent=null] - The parent node.
     * @returns {string} The TAP-formatted text representation of the tree.
     */
    encode(node: TestNode, options?: {
        indent?: number | undefined;
        parent?: TestNode | undefined;
    }): string;
}
import { Parser } from "@nan0web/types";
import TestNode from "./TestNode.js";
