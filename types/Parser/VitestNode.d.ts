/**
 * TestNode extends the base Node class to provide TAP-specific parsing functionality.
 * It adds getters for common TAP metadata like version, test counts, and duration.
 */
export default class VitestNode extends TestNode {
    /**
     * Adds element to the container.
     * @param {any} element
     * @returns {this}
     */
    add(element: any): this;
}
import TestNode from "./TestNode.js";
