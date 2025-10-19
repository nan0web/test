# @nan0web/test

|[Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Documentation|Test coverage|Features|Npm version|
|---|---|---|---|---|
 |🟢 `97.4%` |🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/test/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/test/blob/main/docs/uk/README.md) |🟡 `84.9%` |✅ d.ts 📜 system.md 🕹️ playground |1.0.0 |

A test package with simple utilities for testing in node.js runtime.
Designed for [nan0web philosophy](https://github.com/nan0web/monorepo/blob/main/system.md#%D0%BD%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%BD%D1%8F-%D1%81%D1%86%D0%B5%D0%BD%D0%B0%D1%80%D1%96%D1%97%D0%B2),
where zero dependencies mean maximum freedom and minimal assumptions.

This package helps build ProvenDocs and structured datasets from test examples,
especially useful for LLM fine-tuning.

## Installation

How to install with npm?
```bash
npm install @nan0web/test
```

How to install with pnpm?
```bash
pnpm add @nan0web/test
```

How to install with yarn?
```bash
yarn add @nan0web/test
```

## Core Concepts

This package is designed with zero external dependencies and maximum clarity:
- ✅ Fully typed with **JSDoc** and `.d.ts` files
- 🔁 Includes mocked utilities for real testing scenarios
- 🧠 Built for cognitive clarity: each function has a clear purpose
- 🌱 Enables lightweight testing without side effects

### `MemoryDB(options)`
Utility to simulate a file system for tests.

* **Parameters**
  * `options` – Object of params including:
    - `predefined` – Map of pre-defined file contents (e.g., `{ 'users.json': '[{ id: 1 }]' }`)

How to mock file system using MemoryDB?
```js
import { MemoryDB } from "@nan0web/test"

const db = new MemoryDB({
	predefined: new Map([
		['file1.txt', 'content1'],
		['file2.txt', 'content2'],
	]),
})

await db.connect()
const content = await db.loadDocument('file1.txt')

console.info(content) // 'content1'
```
### `runSpawn(cmd, args, options)`
Utility to mock and execute child processes (for CLI tools).

* **Parameters**
  * `cmd` – command to run (e.g., `"git"`)
  * `args` – array of arguments
  * `opts` – optional spawn options with `onData` handler

* **Returns**
  * `{ code: number, text: string }`

How to use runSpawn as a CLI test tool?
```js
import { runSpawn } from "@nan0web/test"

const { code, text } = await runSpawn('echo', ['hello world'])

console.info(code) // 0
console.info(text.includes('hello world')) // true

```
### `TestPackage(options)`
Class to automate package verification based on nan0web standards.

* **Parameters**
  * `options` – package metadata and file system db instance

How to validate a package using TestPackage.run(rrs)?
```js
import { TestPackage, RRS } from "@nan0web/test"
const db = new MemoryDB()

db.set("system.md", "# system.md")
db.set("tsconfig.json", "{}")
db.set("README.md", "# README.md")
db.set("LICENSE", "ISC")

const pkg = new TestPackage({
	db,
	cwd: ".",
	name: "@nan0web/test",
	baseURL: "https://github.com/nan0web/test"
})

const rrs = new RRS()
const statuses = []

for await (const s of pkg.run(rrs)) {
	statuses.push(s.name + ':' + s.value)
}

console.info(statuses.join('\n'))
```
### `DocsParser`
Parser to extract documentation from tests and generate markdown (ProvenDoc).

It reads js tests with comments like:
```js
it("How to do something?", () => {
  ...
})
```
and converts them into structured `.md` documents.

How to generate documentation using DocsParser?
```js
import { DocsParser } from "@nan0web/test"

const parser = new DocsParser()
const md = parser.decode(() => {
/**
	 * @docs
	 * # Title
	 * Content
 */
	How to do X?
```js
doX()
```

### `DatasetParser`
Parser that converts markdown docs (such as README.md) into structured `.jsonl` datasets.

Each How-to block becomes one test case:
```json
{"instruction": "How to do X?", "output": "```js\n doX()\n```", ...}
```

How to generate dataset from markdown documentation?
```js
import { DatasetParser } from "@nan0web/test"
const md = '# Title\n\nHow to do X?\n```js\ndoX()\n```'
const dataset = DatasetParser.parse(md, '@nan0web/test')

console.info(dataset[0].instruction) // ← "How to do X?"
```
## Playground

This package doesn't use heavy mocking or virtual environments — it simulates them with lightweight wrappers.
You can play in its sandbox as follows:

How to run CLI sandbox?
```bash
git clone https://github.com/nan0web/test.git
cd test
npm install
npm run playground
```

## API Components

has multiple test components that can be imported separately
```js
import { MemoryDB, DocsParser, DatasetParser, runSpawn } from "@nan0web/test"

```
## Java•Script types & Autocomplete
Package is fully typed with jsdoc and d.ts.

How many d.ts files should cover the source?

## Contributing

How to contribute? - [check here](https://github.com/nan0web/test/blob/main/CONTRIBUTING.md)

## License

How to license? - [LICENSE](https://github.com/nan0web/test/blob/main/LICENSE)
