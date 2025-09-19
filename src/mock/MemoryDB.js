import DB, { DocumentEntry, DocumentStat } from "@nan0web/db"

/**
 * MemoryDB class for testing as mock DB.
 * @deprecated Use basic @nan0web/db because it has already all memory functions.
 */
class MemoryDB extends DB {
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
	 * @param {string} [level='r'] Access level
	 * @returns {Promise<void>}
	 */
	async ensureAccess(uri, level = 'r') {
		this.accessLogs.push({ uri, level })
		if (!['r', 'w', 'd'].includes(level)) {
			throw new TypeError([
				"Access level must be one of [r, w, d]",
				"r = read",
				"w = write",
				"d = delete",
			].join("\n"))
		}
	}

	/**
	 * @param {string} uri
	 * @returns {Promise<DocumentEntry[]>}
	 */
	async listDir(uri) {
		const prefix = uri === '.' ? '' : uri.endsWith("/") ? uri : uri + '/'
		const keys = Array.from(this.data.keys())
		const filtered = keys.filter(
			key => key.startsWith(prefix) && key.indexOf('/', prefix.length) === -1
		)
		return filtered.map(key => {
			const name = key.substring(prefix.length)
			const stat = this.meta.get(key) || new DocumentStat({ isFile: true, mtimeMs: Date.now() })
			return new DocumentEntry({ name, stat })
		})
	}

	/**
	 * Resolves path segments to absolute path synchronously
	 * @param  {...string} paths - Path segments
	 * @returns {Promise<string>} Resolved absolute path
	 */
	async resolve(...paths) {
		return Promise.resolve(this.resolveSync(...paths))
	}

	/**
	 * Relative path resolver for file systems.
	 * Must be implemented by platform specific code
	 * @throws Not implemented in base class
	 * @param {string} from Base directory path
	 * @param {string} to Target directory path
	 * @returns {string} Relative path
	 */
	relative(from, to) {
		if (from === this.root) {
			return to.startsWith(from + "/") ? to.substring(from.length + 1) : to
		}
		return to
	}

}

export default MemoryDB
