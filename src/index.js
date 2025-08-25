/**
 * @fileoverview Exporting mock fetch functionality.
 */

import mockFetch from "./mock/fetch.js"
import MemoryDB from "./mock/MemoryDB.js"
import DocsParser from "./Parser/DocsParser.js"
import TestNode from "./Parser/TestNode.js"
import NodeTestParser from "./Parser/NodeTestParser.js"

export {
	mockFetch,
	MemoryDB,
	DocsParser,
	TestNode,
	NodeTestParser,
}

/**
 * Default export for mockFetch function.
 */
export default mockFetch
