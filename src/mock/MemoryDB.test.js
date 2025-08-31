import { describe, it } from 'node:test'
import assert from 'node:assert'
import MemoryDB from './MemoryDB.js'

describe('MemoryDB', () => {
	it('should initialize with predefined data', async () => {
		const db = new MemoryDB({
			predefined: [
				['file1.txt', 'content1'],
				['file2.txt', 'content2']
			]
		})

		assert.strictEqual(db.data.size, 0)
		assert.strictEqual(db.meta.size, 0)

		await db.connect()

		assert.strictEqual(db.data.get('file1.txt'), 'content1')
		assert.strictEqual(db.data.get('file2.txt'), 'content2')
	})

	it('should list directory contents correctly', async () => {
		const db = new MemoryDB({
			predefined: [
				['dir/file1.txt', 'content1'],
				['dir/file2.txt', 'content2'],
				['other.txt', 'other']
			]
		})

		await db.connect()

		const entries = await db.listDir('dir')
		assert.strictEqual(entries.length, 2)
		assert.ok(entries.find(e => e.name === 'file1.txt'))
		assert.ok(entries.find(e => e.name === 'file2.txt'))
	})

	it('should resolve paths synchronously', () => {
		const db = new MemoryDB()
		const resolved = db.resolveSync('dir', 'file.txt')
		assert.ok(resolved)
	})

	it('should calculate relative paths', () => {
		const db = new MemoryDB({ root: '/root' })
		const relative = db.relative('/root', '/root/dir/file.txt')
		assert.strictEqual(relative, 'dir/file.txt')
	})

	it('should log access requests', async () => {
		const db = new MemoryDB()
		await db.ensureAccess('file.txt', 'r')
		assert.deepStrictEqual(db.accessLogs, [{ uri: 'file.txt', level: 'r' }])
	})

	it('should reject invalid access levels', async () => {
		const db = new MemoryDB()
		await assert.rejects(
			async () => await db.ensureAccess('file.txt', 'invalid'),
			{
				name: 'TypeError',
				message: 'Access level must be one of [r, w, d]\nr = read\nw = write\nd = delete'
			}
		)
	})
})