import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import TestPackage from './TestPackage.js'
import RRS from './RRS.js'
import MemoryDB from './mock/MemoryDB.js'

describe('TestPackage', () => {
	/** @type {MemoryDB} */
	let db
	/** @type {TestPackage} */
	let pkg
	beforeEach(() => {
		db = new MemoryDB()
		pkg = new TestPackage({
			db,
			name: "test-package",
			cwd: "/test",
			baseURL: "https://example.com/test-package"
		})
	})

	it("How to use TestPackage.run(rrs, cache) to verify package status?", async () => {
		// ✅ Predefine package files
		db.set("system.md", "# system.md")
		db.set("tsconfig.json", "{}")
		db.set("CONTRIBUTING.md", "# Contributing")
		db.set("LICENSE", "ISC")
		db.set("playground/main.js", "console.log('playground')")
		db.set("README.md", "# README")
		db.set("docs/uk/README.md", "# Документація")
		db.set("src/README.md.js", 'import { it } from "node:test"')
		// ✅ Mock spawn commands for git, build, test, test:coverage and npm info
		const spawn = (cmd, args) => {
			if (cmd === "git") return { code: 0, text: "origin	https://example.com/repo.git (fetch)" }
			if (cmd === "pnpm" || cmd === "npm") {
				if ("info" === args[0]) {
					return { code: 0, text: '{"version":"1.0.0"}' }
				}
				if ("test:coverage" === args[0]) {
					return {
						code: 0, text: [
							"# start of coverage report",
							"# ----------------------",
							"# all files    |  97.34 |    83.33 |   97.96 |",
							"# ----------------------",
							"# end of coverage report",
						].join("\n")
					}
				}
				return { code: 0, text: "" }
			}
			return { code: 1, text: "" }
		}
		pkg.spawn = spawn
		// ✅ Create RRS instance to update with TestPackage.run
		const rrs = new RRS()
		rrs.optional.testCoverage = 95.5
		// ✅ Run tests
		const gen = pkg.run(rrs)
		const status = []
		for await (const s of gen) {
			status.push(s)
		}
		// ✅ Verify the results

		const exp = [
			{ name: 'git remote get-url origin', value: '' },
			{ name: 'git remote get-url origin', value: ' 🟢' },
			{ name: 'pnpm build', value: '' },
			{ name: 'pnpm build', value: ' 🟢' },
			{ name: 'load system.md', value: '' },
			{ name: 'load system.md', value: ' 🟢' },
			{ name: 'pnpm test', value: '' },
			{ name: 'pnpm test', value: ' 🟢' },
			{ name: 'load tsconfig.json', value: '' },
			{ name: 'load tsconfig.json', value: ' 🟢' },
			{ name: 'pnpm test:coverage', value: '' },
			{ name: 'pnpm test:coverage', value: ' 🟢' },
			{ name: 'load CONTRIBUTING.md && load LICENSE', value: '' },
			{ name: 'load CONTRIBUTING.md && load LICENSE', value: ' 🟢' },
			{ name: 'pnpm playground', value: '' },
			{ name: 'pnpm playground', value: ' 🟡' },
			{ name: 'load README.md', value: '' },
			{ name: 'load README.md', value: ' 🟢' },
			{ name: 'load docs/uk/README.md', value: '' },
			{ name: 'load docs/uk/README.md', value: ' 🟢' },
			{ name: 'npm info test-package', value: '' },
			{ name: 'npm info test-package', value: ' 🟢' },
			{ name: 'releases', value: '' },
			{ name: 'releases', value: ' 🟡' },
		]
		assert.deepStrictEqual(status, exp)
	})

	it("How to use TestPackage.render(rrs, options) to generate markdown table?", () => {
		const rrs = new RRS({
			required: { git: 100, systemMd: 0, testPass: 100, buildPass: 100, tsconfig: 100 },
			optional: { readmeTest: 10, playground: 0, testCoverage: 75.5, releaseMd: 1, readmeMd: 1, npmPublished: 1, contributingAndLicense: 1 },
			npmInfo: "1.0.0",
			docs: [
				"[English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://example.com/test-package/blob/main/README.md)",
				"[Українською 🇺🇦](https://example.com/test-package/blob/main/docs/uk/README.md)"
			],
			max: 624
		})
		// ✅ Render full table
		const table = pkg.render(rrs, { head: true, features: ["🧪", "🟢"] })
		// ✅ Verify results
		assert.ok(table.includes('|Package name|'))
		assert.ok(table.includes('[Status]'))
		assert.ok(table.includes('|Documentation|'))
		assert.ok(table.includes('|Test coverage|'))
		assert.ok(table.includes('|Features|'))
		assert.ok(table.includes('|Npm version|'))
		assert.ok(table.includes('🧪 🟢'))
		assert.ok(table.includes('75.5')) // testCoverage from previous test
	})

	it('should create TestPackage instance with default values', () => {
		const pkg = new TestPackage({})

		assert.strictEqual(pkg.cwd, '.')
		assert.strictEqual(pkg.name, '')
		assert.strictEqual(pkg.baseURL, '')
		assert.strictEqual(pkg.hash, '')
	})

	it('should create TestPackage instance from existing TestPackage instance', () => {
		const original = new TestPackage({
			cwd: '/test',
			name: 'test-package',
			baseURL: 'https://example.com/test-package'
		})
		const pkg = TestPackage.from(original)

		assert.strictEqual(pkg, original)
		assert.ok(pkg instanceof TestPackage)
	})

	it('should create new TestPackage instance from plain object', () => {
		const input = {
			cwd: '/test',
			name: 'test-package',
			baseURL: 'https://example.com/test-package'
		}
		const pkg = TestPackage.from(input)

		assert.ok(pkg instanceof TestPackage)
		assert.strictEqual(pkg.cwd, '/test')
		assert.strictEqual(pkg.name, 'test-package')
		assert.strictEqual(pkg.baseURL, 'https://example.com/test-package')
	})

	it("should render table header if head option is true", () => {
		const rrs = new RRS()
		const table = pkg.render(rrs, { head: true, body: false })

		assert.ok(table.includes('|Package name|'))
		assert.ok(table.includes('[Status]'))
		assert.ok(table.includes('|Documentation|'))
		assert.ok(table.includes('|Test coverage|'))
		assert.ok(table.includes('|Features|'))
		assert.ok(table.includes('|Npm version|'))
	})

	it("should render table body if body option is true", () => {
		const rrs = new RRS({
			required: { git: 100, systemMd: 0, testPass: 100, buildPass: 100, tsconfig: 100 },
			optional: { readmeTest: 10, playground: 0, testCoverage: 75.5, releaseMd: 1, readmeMd: 1, npmPublished: 1, contributingAndLicense: 1 },
			npmInfo: "1.0.0",
			docs: [
				"[English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://example.com/test-package/blob/main/README.md)",
				"[Українською 🇺🇦](https://example.com/test-package/blob/main/docs/uk/README.md)"
			],
			max: 624
		})
		const table = pkg.render(rrs, { features: ["🧪", "🟢"] })
		assert.ok(table.includes('[test-package]'))
		assert.ok(table.includes('`78.4%` |'))
		assert.ok(table.includes('|🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿]'))
		assert.ok(table.includes('|🟡 `75.5%` |'))
		assert.ok(table.includes('|🧪 🟢 |'))
		assert.ok(table.includes('|1.0.0 |'))
	})

	it("should render only specified columns", () => {
		const rrs = new RRS({
			required: { git: 100, systemMd: 0, testPass: 100, buildPass: 100, tsconfig: 100 },
			optional: { readmeTest: 10, playground: 0, testCoverage: 75.5, releaseMd: 1, readmeMd: 1, npmPublished: 1, contributingAndLicense: 1 },
			npmInfo: "1.0.0",
			docs: [],
			max: 624
		})

		const table = pkg.render(rrs, { head: true, cols: ['name', 'status'] })
		const rows = table.split('\n')

		// Check header
		assert.ok(rows[0].includes('|Package name|'))
		assert.ok(rows[0].includes('[Status]'))
		assert.ok(!rows[0].includes('Documentation'))
		assert.ok(!rows[0].includes('Test coverage'))
		assert.ok(!rows[0].includes('Features'))
		assert.ok(!rows[0].includes('Npm version'))

		// Check body
		assert.ok(rows[2].includes('[test-package]'))
		assert.ok(rows[2].includes('`78.4%` |'))
		assert.ok(!rows[2].includes('🧪 '))
		assert.ok(!rows[2].includes('🟢 `75.5%` '))
		assert.ok(!rows[2].includes('🧪 🟢 '))
		assert.ok(!rows[2].includes('1.0.0'))
	})

	it("should render documentation links correctly", () => {
		const rrs = new RRS()
		rrs.docs = [
			"[English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://example.com/test-package/blob/main/README.md)",
			"[Українською 🇺🇦](https://example.com/test-package/blob/main/docs/uk/README.md)"
		]
		rrs.optional.readmeTest = 10

		const table = pkg.render(rrs)
		assert.ok(table.includes('🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿]'))
		assert.ok(table.includes('[Українською 🇺🇦]'))
	})

	it("should render documentation links correctly without test", () => {
		const rrs = new RRS()
		rrs.docs = [
			"[English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://example.com/test-package/blob/main/README.md)",
			"[Українською 🇺🇦](https://example.com/test-package/blob/main/docs/uk/README.md)"
		]
		rrs.optional.readmeTest = 0

		const table = pkg.render(rrs)
		assert.ok(table.includes('🟡 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿]'))
		assert.ok(table.includes('[Українською 🇺🇦]'))
	})

	it("should render npm info correctly", () => {
		const rrs = new RRS()
		rrs.npmInfo = "1.0.0"

		const table = pkg.render(rrs)
		assert.ok(table.includes('|1.0.0 |'))
	})

	it("should return plain object representation with toObject()", () => {
		const pkg = new TestPackage({
			cwd: '/test',
			name: 'test-package',
			baseURL: 'https://example.com/test-package'
		})

		const obj = pkg.toObject()
		assert.strictEqual(obj.cwd, '/test')
		assert.strictEqual(obj.name, 'test-package')
		assert.strictEqual(obj.baseURL, 'https://example.com/test-package')
		assert.strictEqual(obj.hash, '')
		assert.ok(typeof obj.db === 'object')
	})
})
