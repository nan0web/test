import { before, describe, it } from "node:test"
import assert from "node:assert"
import MemoryDB from "../../src/mock/MemoryDB.js"

describe("MemoryDB", () => {
	it("Mock database implementation should not require external dependencies", async () => {
		// MemoryDB should work without connecting to real database
		const db = new MemoryDB()
		assert.ok(db)
		assert.ok(!db.connected)
	})

	it("Predefined test data should be loaded during connection", async () => {
		const db = new MemoryDB({
			predefined: [
				['test.txt', 'test content']
			]
		})
		
		await db.connect()
		
		const content = await db.loadDocument('test.txt')
		assert.strictEqual(content, 'test content')
	})

	it("Directory listing and path resolution should work correctly", async () => {
		const db = new MemoryDB({
			predefined: [
				['dir/file1.txt', 'content1'],
				['dir/file2.txt', 'content2']
			]
		})
		
		await db.connect()
		
		const entries = await db.listDir('dir')
		assert.strictEqual(entries.length, 2)
		assert.ok(entries.find(e => e.name === 'file1.txt'))
		assert.ok(entries.find(e => e.name === 'file2.txt'))
		
		const resolved = await db.resolve('dir', 'file1.txt')
		assert.ok(resolved)
	})

	it("Support for reading, writing and listing virtual filesystem entries", async () => {
		const db = new MemoryDB()
		await db.connect()
		
		await db.saveDocument('virtual.txt', 'virtual content')
		const content = await db.loadDocument('virtual.txt')
		assert.strictEqual(content, 'virtual content')
		
		const entries = await db.listDir('.')
		assert.ok(entries.find(e => e.name === 'virtual.txt'))
	})

	it("Path resolution with support for relative and absolute paths", async () => {
		const db = new MemoryDB({ root: '/root' })
		await db.connect()
		
		const absolute = await db.resolve('/root', 'file.txt')
		const relative = db.relative('/root', '/root/dir/file.txt')
		
		assert.ok(absolute)
		assert.strictEqual(relative, 'dir/file.txt')
	})

	it("Access logging for test verification", async () => {
		const db = new MemoryDB()
		await db.connect()
		
		await db.ensureAccess('test.txt', 'r')
		await db.ensureAccess('test.txt', 'w')
		
		assert.strictEqual(db.accessLogs.length, 2)
		assert.deepStrictEqual(db.accessLogs[0], { uri: 'test.txt', level: 'r' })
		assert.deepStrictEqual(db.accessLogs[1], { uri: 'test.txt', level: 'w' })
	})
})