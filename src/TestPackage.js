import DB from "@nan0web/db"
import { createT } from "@nan0web/i18n"
import { MDHeading1, MDHeading2, MDParagraph } from "@nan0web/markdown"
import RRS from "./RRS.js"
import runSpawn from "./exec/runSpawn.js"

export default class TestPackage {
	static COLUMNS = {
		name: "Package name",      // t("Package name")
		status: "Status",          // t("Status")
		docs: "Documentation",     // t("Documentation")
		coverage: "Test coverage", // t("Test coverage")
		features: "Features",      // t("Features")
		npm: "Npm version",        // t("Npm version")
	}
	static STATUS_REF = "https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв"
	static RELATED = [
		".gitignore",
		".coverage/test.json",
		".datasets/README.dataset.jsonl",
		"CONTRIBUTING.md",
		"docs/uk/README.md",
		"LICENSE",
		"playground/main.js",
		"README.md",
		"system.md",
		"tsconfig.json",
	]
	static SCRIPTS = {
		"build": "tsc",
		"clean": "rm -rf .cache/ && rm -rf dist/",
		"clean:modules": "rm -rf node_modules",
		"test": 'node --test "src/**/*.test.js"',
		"test:docs": "node --test src/README.md.js",
		"test:release": 'node --test "releases/**/*.test.js"',
		"test:coverage": 'node --experimental-test-coverage --test-coverage-include="src/**/*.js" --test-coverage-exclude="src/**/*.test.js" --test "src/**/*.test.js"',
		"test:coverage:collect": "nan0test coverage",
		"test:status": "nan0status",
		"precommit": "npm test",
		"prepush": "npm test",
		"prepare": "husky"
	}
	static DEV_DEPENDENCIES = {
		"@nan0web/test": "workspace:*"
	}
	static GIT_IGNORED = [
		"/.coverage/",
		"/.datasets/",
		"/chat/",
		"/dist/",
		"/node_modules/",
		"/me.md",
	]
	/** @type {DB} */
	#db
	/** @type {string} */
	cwd
	/** @type {string} */
	name
	/** @type {string} */
	baseURL
	/** @type {string} */
	hash
	/**
	 *
	 * @param {object} input
	 * @param {DB} [input.db]
	 * @param {string} [input.cwd]
	 * @param {string} [input.name]
	 * @param {string} [input.hash]
	 * @param {string} [input.baseURL]
	 */
	constructor(input) {
		const {
			cwd,
			db = new DB(),
			name = "",
			hash = "",
			baseURL = "",
		} = input
		this.cwd = String(cwd || ".")
		this.#db = db
		this.name = String(name)
		this.hash = String(hash)
		this.baseURL = String(baseURL)
	}

	/** @returns {DB} */
	get db() {
		return this.#db
	}

	/** @returns {string[]} this.constructor.RELATED */
	get RELATED() {
		return /** @type {typeof TestPackage} **/ (this.constructor).RELATED
	}

	get COLUMNS() {
		return /** @type {typeof TestPackage} */ (this.constructor).COLUMNS
	}

	get STATUS_REF() {
		return /** @type {typeof TestPackage} */ (this.constructor).STATUS_REF
	}
	get SCRIPTS() {
		return /** @type {typeof TestPackage} */ (this.constructor).SCRIPTS
	}
	get DEV_DEPENDENCIES() {
		return /** @type {typeof TestPackage} */ (this.constructor).DEV_DEPENDENCIES
	}
	get GIT_IGNORED() {
		return /** @type {typeof TestPackage} */ (this.constructor).GIT_IGNORED
	}

	/**
	 *
	 * @param {RRS} rrs
	 * @param {*} cache
	 * @returns {AsyncGenerator<{ name: string, value: any }>}
	 */
	async * run(rrs, cache = false) {
		this.hash = ""
		for (const file of this.RELATED) {
			const stat = await this.db.statDocument(file)
			this.hash += file + ":" + stat.mtimeMs + ";"
		}
		const pkg = await this.db.loadDocument("package.json", {})
		cache = cache?.pkg?.hash === this.hash

		const cwd = this.cwd
		const docs = []
		let name = "git remote get-url origin"
		yield { name, value: "" }
		if (!cache) {
			const result = await this.spawn("git", ["remote", "get-url", "origin"], { cwd })
			if (0 !== result.code) {
				rrs.required.git = 0
			}
		}
		yield { name, value: rrs.required.git ? " 🟢" : " 🔴" }
		name = "pnpm build"
		yield { name, value: "" }
		if (!cache) {
			const result = await this.spawn("pnpm", ["build"], { cwd })
			if (0 !== result.code) {
				rrs.required.buildPass = 0
			}
		}
		yield { name, value: rrs.required.buildPass ? " 🟢" : " 🔴" }
		name = "load system.md"
		yield { name, value: "" }
		if (!cache) {
			const systemMd = await this.db.loadDocument("system.md", "")
			if ("" === systemMd) {
				rrs.required.systemMd = 0
			}
		}
		yield { name, value: rrs.required.systemMd ? " 🟢" : " 🔴" }
		name = "pnpm test"
		yield { name, value: "" }
		if (!cache) {
			const result = await this.spawn("pnpm", ["test"], { cwd })
			if (0 !== result.code) {
				rrs.required.testPass = 0
			}
		}
		yield { name, value: rrs.required.testPass ? " 🟢" : " 🔴" }
		name = "load tsconfig.json"
		yield { name, value: "" }
		if (!cache) {
			const tsconfig = await this.db.loadDocument("tsconfig.json", "")
			if ("" === tsconfig) {
				rrs.required.tsconfig = 0
			}
		}
		yield { name, value: rrs.required.tsconfig ? " 🟢" : " 🔴" }
		name = "pnpm test:coverage"
		yield { name, value: "" }
		if (!cache) {
			const result = await this.spawn("pnpm", ["test:coverage"], { cwd })
			const coverage = await this.db.loadDocument(".coverage/test.json")
			rrs.optional.testCoverage = 0
			if (0 === result.code) {
				const rows = result.text.split("\n")
				const startIndex = rows.findIndex(r => "# start of coverage report" === r)
				const endIndex = rows.findIndex(r => "# end of coverage report" === r)
				const coverage = rows.slice(startIndex, endIndex)
				if (coverage.length > 3) {
					const allFiles = coverage[coverage.length - 2] || ""
					if (allFiles.startsWith("# all files ")) {
						const cols = allFiles.split(" |")
						rrs.optional.testCoverage = Math.max(
							parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3]),
						)
					}
				}
			}
		}
		yield { name, value: rrs.optional.testCoverage ? " 🟢" : " 🟡" }
		name = "load CONTRIBUTING.md && load LICENSE"
		yield { name, value: "" }
		if (!cache) {
			const contributeMd = await this.db.loadDocument("CONTRIBUTING.md", "")
			const license = await this.db.loadDocument("LICENSE", "")
			if ("" === license || contributeMd === "") {
				rrs.optional.contributingAndLicense = 0
			}
		}
		yield { name, value: rrs.optional.contributingAndLicense ? " 🟢" : " 🟡" }
		name = "pnpm playground"
		yield { name, value: "" }
		if (!cache) {
			if (!pkg?.scripts?.playground) {
				rrs.optional.playground = 0
			}
		}
		yield { name, value: rrs.optional.playground ? " 🟢" : " 🟡" }
		name = "load README.md"
		yield { name, value: "" }
		if (!cache) {
			const readmeMd = await this.db.loadDocument("README.md", "")
			if ("" === readmeMd) {
				rrs.optional.readmeMd = 0
			} else {
				docs.push(`[English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](${this.baseURL}blob/main/README.md)`)
			}
		}
		yield { name, value: rrs.optional.readmeMd ? " 🟢" : " 🟡" }
		name = "load docs/uk/README.md"
		yield { name, value: "" }
		if (!cache) {
			const docsMd = await this.db.loadDocument("docs/uk/README.md", "")
			if ("" !== docsMd) {
				docs.push(`[Українською 🇺🇦](${this.baseURL}blob/main/docs/uk/README.md)`)
			}

			const readmeTest = await this.db.loadDocument("src/README.md.js", "")
			if ("" === readmeTest) {
				rrs.optional.readmeTest = 0
			}
		}
		yield { name, value: rrs.optional.readmeTest ? " 🟢" : " 🟡" }
		name = "npm info @nan0web/" + this.name
		yield { name, value: "" }
		if (!cache) {
			const result = await this.spawn("npm", ["info", "@nan0web/" + this.name], { cwd })
			if (0 !== result.code) {
				rrs.optional.npmPublished = 0
			} else {
				rrs.npmInfo = result.text
			}
		}
		yield { name, value: rrs.optional.npmPublished ? " 🟢" : " 🟡" }
		name = "releases"
		yield { name, value: "" }
		if (!cache) {
			const releases = Array.from(this.db.meta.keys()).filter(k => k.endsWith("release.md") && k.startsWith("releases/"))
			if (1 !== releases.length) {
				rrs.optional.releaseMd = 0
			}
		}
		yield { name, value: rrs.optional.releaseMd ? " 🟢" : " 🟡" }
		if (docs.length || !cache) {
			rrs.docs = docs
		}
	}

	/**
	 * Spawns a child process and returns a promise that resolves when the process closes.
	 *
	 * @param {string} cmd - The command to run.
	 * @param {string[]} [args=[]] - List of arguments to pass to the command.
	 * @param {Object} [opts={}] - Options to pass to spawn.
	 * @param {(chunk: Buffer) => void} [opts.onData] - Callback for handling data from stdout. Default is no-op.
	 * @param {string} [opts.cwd] - Current working directory.
	 *
	 * @returns {Promise<{ code: number; text: string }>} A promise resolving with process exit code and stdout content.
	 *
	 * @example
	 * const { code, text } = await this.spawn('git', ['remote', 'get-url', 'origin']);
	 */
	async spawn(cmd, args = [], opts = {}) {
		return await runSpawn(cmd, args, opts)
	}

	/**
	 * @param {RRS} rrs
	 * @param {object} [options]
	 * @param {string[]} [options.cols]
	 * @param {string[]} [options.features]
	 * @param {boolean} [options.head=false] Renders table header if true
	 * @param {boolean} [options.body=true] Renders table body if true
	 * @param {boolean} [options.refs=true] Renders references to source doc if head is true
	 * @param {function} [options.t]
	 * @returns {string}
	 */
	render(rrs, options = {}) {
		const {
			features = [],
			head = false,
			body = true,
			refs = true,
			cols = Object.keys(TestPackage.COLUMNS),
			t = createT({})
		} = options
		const table = []
		if (head) {
			const row = []
			const keys = Object.keys(TestPackage.COLUMNS)
			for (const key of keys) {
				if (cols.includes(key)) {
					const val = TestPackage.COLUMNS[key]
					if (refs && val === TestPackage.COLUMNS.status) {
						row.push(`[${t(val)}](${TestPackage.STATUS_REF})`)
					} else {
						row.push(t(val))
					}
				}
			}
			table.push(["", ...row, ""].join("|"))
			const space = []
			for (const key of keys) {
				if (cols.includes(key)) space.push("---")
			}
			table.push(["", ...space, ""].join("|"))
		}
		if (body) {
			const row = []
			if (cols.includes("name")) {
				row.push(rrs.required.git ? `[${this.name}](${this.baseURL})` : this.name)
			}
			if (cols.includes("status")) row.push(rrs.icon())
			if (cols.includes("docs")) {
				row.push((rrs.optional.readmeTest ? "🧪 " : "🟡 ") + rrs.docs.join("<br />"))
			}
			if (cols.includes("coverage")) row.push(rrs.coverage())
			if (cols.includes("features")) row.push(features.join(" "))
			if (cols.includes("npm")) row.push(rrs.npmInfo || "—")
			table.push(["", ...row, ""].join(" |"))
		}
		return table.join("\n")
	}
	/**
	 * @param {RRS} rrs
	 * @returns {MDHeading1}
	 */
	toMarkdown(rrs) {
		const md = new MDHeading1({ content: "TODO" })
		rrs.todo.forEach(name => {
			md.add(new MDHeading2({ content: name.startsWith("!") ? "Required " + name.slice(1) : "Optional " + name }))
			md.add(new MDParagraph({ content: "Add " + name }))
		})
		return md
	}
	toObject() {
		return {
			...this,
			db: this.#db.options
		}
	}
	/**
	 * @param {*} input
	 * @returns {TestPackage}
	 */
	static from(input) {
		if (input instanceof TestPackage) return input
		return new TestPackage(input)
	}
}
