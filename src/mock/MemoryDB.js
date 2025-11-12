import DB, { DocumentStat } from "@nan0web/db"

/**
 * MemoryDB class for testing as mock DB.
 * @deprecated Use basic @nan0web/db because it has already all memory functions.
 */
export default class MemoryDB extends DB {
	/** @type {Array<{ uri: string, level: string }>} */
	accessLogs = []
	/**
	 * @example
	 * ```js
	 * const db = new MemoryDB({
	 * 	predefined: [
	 * 		['file1.txt', 'content1'],
	 * 		['file2.txt', 'content2'],
	 * 	]
	 * })
	 * await db.connect()
	 * const entries = []
	 * for await (const entry of db.readDir('.', { depth: 0 })) {
	 * 	entries.push(entry)
	 * }
	 * const content = await db.loadDocument("file1.txt")
	 * ```
	 * @param {object} input
	 * @param {string} [input.root="."]
	 * @param {string} [input.cwd="."]
	 * @param {boolean} [input.connected=false]
	 * @param {Map<string, any | false>} [input.data=new Map()]
	 * @param {Map<string, DocumentStat>} [input.meta=new Map()]
	 * @param {DB[]} [input.dbs=[]]
	 * { root?: string | undefined; cwd?: string | undefined; connected?: boolean | undefined; data?: Map<string, any> | undefined; meta?: Map<string, DocumentStat> | undefined; dbs?: DB[] | undefined; }'
	 */
	constructor(input = {}) {
		super(input)
		this.accessLogs = []
	}

	/**
	 * Ensures access for given URI and level, if not @throws an error.
	 * @note Must be overwritten by platform specific application
	 * @param {string} uri - Document URI
	 * @param {"r" | "w" | "d"} [level='r'] Access level
	 * @returns {Promise<void>}
	 */
	async ensureAccess(uri, level = 'r') {
		this.accessLogs.push({ uri, level })
		return await super.ensureAccess(uri, level)
	}
}
