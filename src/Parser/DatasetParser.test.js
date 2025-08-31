import { describe, it } from 'node:test'
import assert from 'node:assert'
import DatasetParser from './DatasetParser.js'

describe('DatasetParser', () => {
	it('should parse a markdown text into dataset entries', () => {
		const text = `
# Package Name

Description of the package.

## Installation

Install the package locally.

How to install with npm?
\`\`\`bash
npm install package-name
\`\`\`

## API

### \`createFn(options)\`

Creates a function with given options.

* **Parameters**
  * \`options\` – Configuration options.

How to use createFn?
\`\`\`js
const fn = createFn({ option: true })
assert.ok(fn)
\`\`\`
`
		const dataset = DatasetParser.parse(text, 'package-name')

		assert.strictEqual(dataset.length, 2)
		assert.deepStrictEqual(dataset[0], {
			instruction: 'How to install with npm?',
			output: '```bash\nnpm install package-name\n```',
			context: ['h1:Package Name', 'h2:Installation'],
			input: '## Installation\n\nInstall the package locally.\n',
			tags: ['Package Name', 'Installation'],
			proven: 'assert-in-package-name'
		})
		assert.deepStrictEqual(dataset[1], {
			instruction: 'How to use createFn?',
			output: '```js\nconst fn = createFn({ option: true })\nassert.ok(fn)\n```',
			context: ['h1:Package Name', 'h2:API', 'h3:`createFn(options)`'],
			input: '### \`createFn(options)\`\n\nCreates a function with given options.\n\n* **Parameters**\n\n  * `options` – Configuration options.\n',
			tags: ['Package Name', 'API', 'createFn(options)'],
			proven: 'assert-in-package-name'
		})
	})
	
	it('should return empty array for markdown without instructions', () => {
		const text = `
# Title

Just some content without any instructions.
`
		const dataset = DatasetParser.parse(text, 'package-name')
		assert.strictEqual(dataset.length, 0)
	})
})