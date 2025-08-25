import DB, { DocumentEntry, DocumentStat } from "@nan0web/db"

/**
 * MemoryDB class for testing as mock DB.
 */
class MemoryDB extends DB {
	/** @type {Map<string, any>} */
	predefined = new Map()
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
	 * @param {Array | Map} [input.predefined]
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
		const {
			predefined = new Map()
		} = input
		this.accessLogs = []
		this.predefined = new Map(predefined)
	}

	/**
	 * @returns {Promise<void>}
	 */
	async connect() {
		await super.connect()
		for (const [key, value] of this.predefined.entries()) {
			this.data.set(key, value)
			this.meta.set(key, new DocumentStat({
				size: Buffer.byteLength(JSON.stringify(value)),
				mtimeMs: Date.now(),
				isFile: true,
			}))
		}
		for (const [key] of this.meta.entries()) {
			const dir = (this.resolveSync(key, "..") || ".") + "/"
			if (!this.meta.has(dir)) {
				const children = Array.from(this.meta.entries()).filter(
					([m, stat]) => stat.isFile && (m.startsWith(dir + "/") || "." === dir)
				)
				let size = 0
				let mtimeMs = 0
				children.forEach(([, stat]) => {
					size = Math.max(stat.size, size)
					mtimeMs = Math.max(stat.mtimeMs, mtimeMs)
				})
				this.meta.set(dir, new DocumentStat({ size, mtimeMs, isDirectory: true }))
			}
		}
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
