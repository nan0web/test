/**
 * TestNode extends the base Node class to provide TAP-specific parsing functionality.
 * It adds getters for common TAP metadata like version, test counts, and duration.
 */
export default class VitestNode extends TestNode {
    /**
     * Create a TestNode from input data.
     * @param {object} input - The input data to create a TestNode from.
     * @returns {VitestNode} The created TestNode instance.
     */
    static from(input: object): VitestNode;
    /**
     * Create a new TestNode instance.
     * @param {object} input - The input object to initialize the node.
     * @param {VitestNode[]} [input.children=[]] - Array of child nodes.
     * @param {string} [input.content=""] - Content of the node.
     * @param {number} [input.indent=0] - Content of the node.
     * @param {VitestNode} [input.parent=null] - Parent node.
     */
    constructor(input?: {
        children?: VitestNode[] | undefined;
        content?: string | undefined;
        indent?: number | undefined;
        parent?: VitestNode | undefined;
    });
    /** @type {VitestNode[]} */
    children: VitestNode[];
    /**
     * Finds an element by filter.
     *
     * @param {(v:any)=>boolean} filter
     * @param {boolean} [recursively=false]
     * @returns {VitestNode | null}
     */
    find(filter: (v: any) => boolean, recursively?: boolean | undefined): VitestNode | null;
    /**
     * Adds element to the container.
     * @param {any} element
     * @returns {this}
     */
    add(element: any): this;
    /**
     * Flattens the tree into an array.
     *
     * @returns {VitestNode[]}
     */
    flat(): VitestNode[];
    /**
     * @returns {VitestNode[]}
     */
    toArray(): VitestNode[];
    /**
     * Filters children.
     *
     * @param {(v: VitestNode) => boolean} [filter=()=>true]
     * @param {boolean} [recursively=false]
     * @returns {VitestNode[]}
     */
    filter(filter?: ((v: VitestNode) => boolean) | undefined, recursively?: boolean | undefined): VitestNode[];
}
import TestNode from "./TestNode.js";
