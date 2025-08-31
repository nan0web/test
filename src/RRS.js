/**
 * Release Readiness Score (RRS) calculator.
 * Evaluates project readiness based on required and optional criteria.
 */

/**
 * Criteria that are required for full release readiness.
 * Each criterion contributes significantly to the total score.
 *
 * @typedef {Object} RRSCriteria
 * @property {number} git - Weight for presence of git repository
 * @property {number} systemMd - Weight for presence of SYSTEM.md
 * @property {number} testPass - Weight for passing test suite
 * @property {number} buildPass - Weight for successful build
 * @property {number} tsconfig - Weight for presence of tsconfig.json
 */

/**
 * Optional criteria that enhance project quality.
 * Each provides bonus points or minor validation.
 *
 * @typedef {Object} RRSOptionalCriteria
 * @property {number} readmeTest - Weight for presence of src/README.md.js
 * @property {number} playground - Weight for playground or interactive examples
 * @property {number} testCoverage - Score based on test coverage percentage (0–100)
 * @property {number} releaseMd - Weight for release documentation (e.g., RELEASE.md)
 * @property {number} readmeMd - Weight for presence of README.md
 * @property {number} npmPublished - Weight if package is published to npm
 * @property {number} contributingAndLicense - Weight if CONTRIBUTING.md and LICENSE exist
 * @property {Map} translations - Map of the translated docs
 */

/**
 * Represents required criteria for release readiness.
 * Values can be customized via constructor input.
 */
class RRSRequired {
	/**
	 * Score contribution if git repository exists.
	 * @type {number}
	 */
	git = 100
	/**
	 * Score contribution if SYSTEM.md exists (documentation of architecture).
	 * @type {number}
	 */
	systemMd = 100

	/**
	 * Score contribution if test suite passes.
	 * @type {number}
	 */
	testPass = 100

	/**
	 * Score contribution if build completes successfully.
	 * @type {number}
	 */
	buildPass = 100

	/**
	 * Score contribution if tsconfig.json exists (indicates TypeScript setup).
	 * @type {number}
	 */
	tsconfig = 100

	/**
	 * Creates a new RRSRequired instance with custom values.
	 * @param {Partial<RRSCriteria>} [input] - Optional override values
	 */
	constructor(input = {}) {
		const {
			git = this.git,
			systemMd = this.systemMd,
			testPass = this.testPass,
			buildPass = this.buildPass,
			tsconfig = this.tsconfig,
		} = input

		this.git = Number(git)
		this.systemMd = Number(systemMd)
		this.testPass = Number(testPass)
		this.buildPass = Number(buildPass)
		this.tsconfig = Number(tsconfig)
	}

	/**
	 * Returns UTF icon related to a field
	 * @param {string} name
	 * @returns {string}
	 */
	icon(name) {
		if ("git" === name) return "git"
		if ("systemMd" === name) return "🤖"
		if ("testPass" === name) return "✅"
		if ("buildPass" === name) return "💿"
		if ("tsconfig" === name) return "ts"
		return ""
	}

	/**
	 * Returns an RRSRequired instance.
	 * If input is already an instance, returns it. Otherwise, creates a new one.
	 *
	 * @param {RRSRequired | any} input - Input data or existing instance
	 * @returns {RRSRequired}
	 */
	static from(input) {
		return input instanceof RRSRequired ? input : new RRSRequired(input)
	}
}

/**
 * Represents optional or bonus criteria for release readiness.
 * Values can be customized via constructor input.
 */
class RRSOptional {
	/**
	 * Score if src/README.md.js exists (documentation-driven testing).
	 * @type {number}
	 */
	readmeTest = 10

	/**
	 * Score for presence of playground or example sandbox.
	 * @type {number}
	 */
	playground = 10

	/**
	 * Additional score based on test coverage (0–100).
	 * @type {number}
	 */
	testCoverage = 0

	/**
	 * Score if release documentation (e.g., RELEASE.md) exists.
	 * @type {number}
	 */
	releaseMd = 1

	/**
	 * Score if README.md exists (basic project description).
	 * @type {number}
	 */
	readmeMd = 1

	/**
	 * Score if the package is published to npm.
	 * @type {number}
	 */
	npmPublished = 1

	/**
	 * Score if CONTRIBUTING.md and LICENSE files exist.
	 * @type {number}
	 */
	contributingAndLicense = 1

	/**
	 * Required translations
	 */
	translations = new Map()

	/**
	 * Creates a new RRSOptional instance with custom values.
	 * @param {Partial<RRSOptionalCriteria>} [input] - Optional override values
	 */
	constructor(input = {}) {
		const {
			readmeTest = this.readmeTest,
			playground = this.playground,
			testCoverage = this.testCoverage,
			releaseMd = this.releaseMd,
			readmeMd = this.readmeMd,
			npmPublished = this.npmPublished,
			contributingAndLicense = this.contributingAndLicense,
			translations = this.translations,
		} = input

		this.readmeTest = Number(readmeTest)
		this.playground = Number(playground)
		this.testCoverage = Number(testCoverage)
		this.releaseMd = Number(releaseMd)
		this.readmeMd = Number(readmeMd)
		this.npmPublished = Number(npmPublished)
		this.contributingAndLicense = Number(contributingAndLicense)
		this.translations = new Map(
			translations instanceof Map ? translations :
			Array.isArray(translations) ? translations :
			"object" === typeof translations ? Object.entries(translations) : []
		)
	}

	/**
	 * Returns UTF icon related to a field
	 * @param {string} name
	 * @returns {string}
	 */
	icon(name) {
		if ("readmeTest" === name) return "🧪"
		if ("playground" === name) return "🕹️"
		if ("testCoverage" === name) return "⚙️"
		if ("releaseMd" === name) return "📜"
		if ("readmeMd" === name) return "📖"
		if ("npmPublished" === name) return "npm"
		if ("contributingAndLicense" === name) return "🛜"
		return ""
	}

	/**
	 * Returns an RRSOptional instance.
	 * If input is already an instance, returns it. Otherwise, creates a new one.
	 *
	 * @param {RRSOptional | any} input - Input data or existing instance
	 * @returns {RRSOptional}
	 */
	static from(input) {
		return input instanceof RRSOptional ? input : new RRSOptional(input)
	}
}

/**
 * Configuration for Release Readiness Score (RRS).
 * Contains required and optional criteria and the maximum possible score.
 */
class RRS {
	static Required = RRSRequired
	static Optional = RRSOptional
	/**
	 * Required criteria for baseline readiness.
	 * @type {RRSRequired}
	 */
	required = new RRSRequired()

	/**
	 * Optional or bonus criteria that enhance project quality.
	 * @type {RRSOptional}
	 */
	optional = new RRSOptional()

	/**
	 * NPM version
	 * @type {string}
	 */
	npmInfo = ""

	/**
	 * Available documentation
	 * @type {string[]}
	 */
	docs = []

	/**
	 * Maximum possible score (sum of required + optional weights).
	 * Default: (500 required + 124 optional).
	 * @type {number}
	 */
	max = 624

	/**
	 * Creates a new RRS instance with custom required, optional, and max values.
	 *
	 * @param {Object} [input] - Configuration options
	 * @param {Partial<RRSCriteria>} [input.required] - Override required criteria
	 * @param {Partial<RRSOptionalCriteria>} [input.optional] - Override optional criteria
	 * @param {string} [input.npmInfo] - NPM info (version)
	 * @param {string[]} [input.docs] - Available documentation.
	 * @param {number} [input.max] - Custom maximum score
	 */
	constructor(input = {}) {
		this.required = RRSRequired.from(input.required)
		this.optional = RRSOptional.from(input.optional)
		this.npmInfo = String(input.npmInfo || "")
		this.docs = Array.from(input.docs || []).map(String)
		this.max = input.max !== undefined ? Number(input.max) : this.max
	}

	/**
	 * @returns {number}
	 */
	get percentage() {
		const totalRequired = Object.values(this.required).reduce((a, b) => a + b, 0)
		const totalOptional = Object.values(this.optional).reduce((a, b) => "number" === typeof b ? a + b : a, 0)
		const score = totalRequired + totalOptional
		return 100 * score / this.max
	}

	/**
	 * Returns missing (zero-value) properties separated by " "
	 * @returns {string}
	 */
	get missing() {
		const result = []
		for (const [name, value] of Object.entries(this.required)) {
			if (0 === value) result.push(this.required.icon(name))
		}
		for (const [name, value] of Object.entries(this.optional)) {
			if (0 === value) result.push(this.optional.icon(name))
		}
		return result.join(" ")
	}

	/**
	 * Returns todo list.
	 * @returns {string[]}
	 */
	get todo() {
		const result = []
		for (const [name, value] of Object.entries(this.required)) {
			if (0 === value) result.push("!" + name)
		}
		for (const [name, value] of Object.entries(this.optional)) {
			if (0 === value) result.push(name)
		}
		return result
	}

	/**
	 * @param {string} [format="`"]
	 * @returns {string}
	 */
	icon(format = "`") {
		let icon = "🔴"
		const percentage = this.percentage
		if (percentage > 80) {
			icon = "🟢"
			if (percentage < 90) icon = "🟡"
		}

		return icon + " " + format + percentage.toFixed(1) + "%" + format
	}

	/**
	 * @param {string} [format="`"]
	 * @returns {string}
	 */
	coverage(format = "`") {
		if (0 === this.optional.testCoverage) return "-"
		const c = Number(this.optional.testCoverage)
		if (90 <= c) return "🟢 " + format + Number(c).toFixed(1) + "%" + format
		if (60 <= c) return "🟡 " + format + Number(c).toFixed(1) + "%" + format
		return "🔴 " + format + Number(c).toFixed(1) + "%" + format
	}

	/**
	 * Returns an RRS instance.
	 * If input is already an instance, returns it. Otherwise, creates a new one.
	 *
	 * @param {RRS | any} input - Input data or existing instance
	 * @returns {RRS}
	 */
	static from(input) {
		return input instanceof RRS ? input : new RRS(input)
	}
}

export default RRS
