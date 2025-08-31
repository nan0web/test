# @nan0web/test

## Документація з тестів

Документація з тестами зберігається у файлах `src/**/*.md.js` у файлах `src/**/*.test.js` не використовується.

Зазвичай вистачає одного файлу `src/README.md.js`.

Для створення надійної та завжди точної документації:

1. Пишіть документацію всередині тестових функцій, використовуючи спеціальні маркери
2. Використовуйте анотацію `* @docs` у JSDoc, за якою йде markdown вміст
3. Документуйте API, приклади використання та поведінку через перевірки (assertions)
4. Зберігайте markdown файли у момент тестів

```js
import { describe, it, after, before, beforeEach } from "node:test";
import assert from "node:assert";
import FS from "@nan0web/db-fs";
import { NoConsole } from "@nan0web/log";
import { DocsParser, MemoryDB, mockFetch } from "@nan0web/test";

const fs = new FS();
let pkg = {};
const originalConsole = console;

/**
 * Core test suite that also serves as the source for README generation.
 */
function testRender() {
	before(async () => {
		pkg = await fs.loadDocument("package.json", pkg);
	});
	beforeEach(() => {
		console = new NoConsole();
	});
	after(() => {
		console = originalConsole;
	});
	/**
	 * @docs
	 * # @nan0web/test
	 *
	 * A test package with simple utilities for testing in node.js runtime.
	 *
	 * ## Install
	 * ```bash
	 * npm install @nan0web/test
	 * ```
	 *
	 * ## Usage
	 */
	it("Example usage of mockFetch and MemoryDB", async () => {
		//import { mockFetch, MemoryDB } from '@nan0web/test'

		// ✅ Create a mock fetch function
		const fetch = mockFetch([
			["GET /users", { id: 1, name: "John Doe" }],
			["POST /users", [201, { id: 2, name: "Jane Smith" }]],
		]);

		// ✅ Use the mock fetch
		const response = await fetch("/users");
		const data = await response.json();
		console.log(data); // { id: 1, name: 'John Doe' }

		// ✅ Create a mock DB
		const db = new MemoryDB({
			predefined: [
				["file1.txt", "content1"],
				["file2.txt", "content2"],
			],
		});

		// ✅ Use the mock DB
		await db.connect();
		const content = await db.loadDocument("file1.txt");
		console.log(content); // 'content1'
		assert.deepStrictEqual(console.output(), [
			["log", { id: 1, name: "John Doe" }],
			["log", "content1"],
		]);
	});

	/**
	 * @docs
	 * ## API
	 * ...
	 * ## Testing
	 */
	it("Run the bundled tests with:", () => {
		/**
		 * ```bash
		 * npm test
		 * ```
		 * The test suite covers default behaviour, placeholder substitution and fallback
		 * logic.
		 */
		assert.ok(String(pkg.scripts?.test).startsWith("node --test"));
	});

	/**
	 * @docs
	 * ## Contributing
	 */
	it("Ready to contribute [check here](./CONTRIBUTING.md)", async () => {
		/** @docs */
		const text = await fs.loadDocument("CONTRIBUTING.md");
		const str = String(text);
		assert.ok(str.includes("# Contributing"));
	});

	/**
	 * @docs
	 * ## License
	 */
	it("ISC – see the [LICENSE](./LICENSE) file.", async () => {
		/** @docs */
		const text = await fs.loadDocument("LICENSE");
		assert.ok(String(text).includes("ISC"));
	});
}

describe("README.md", testRender);

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})
```

## Стоп слова

Наступні стоп слова використовуються для контролю парсингу документації:

- `/** @docs */` – Позначає початок блоку документації
- `assert.` – Вказує на тестові перевірки, які мають бути включені в документацію
- `it(` – Позначає описи тестових функцій, які стають розділами документації

## Правила формату тестової документації

1. Кожен блок документації має починатися всередені багаторядкового коментаря з `/**\n * @docs`
2. Вміст документації йде всередині коментаря у форматі markdown і також вміст тесту автоматично потрапляє у документацію
3. Тестові перевірки демонструють справжню поведінку системи
4. Усі приклади коду мають бути виконуваними та правильними

## Витягування документації

Документація витягується з тестових файлів за допомогою DocsParser:

1. Парсер знаходить блоки `* @docs` => (`/** @docs */` | `assert.`)
2. Збирає markdown вміст з коментарів
3. Включає виконувані приклади з тіл тестових функцій
4. Створює чисті markdown файли для розповсюдження

## Приклад структури

Приклад показує як парсер обробляє коментарі та код:

```js
/**
 * @docs
 * ## API
 *
 * ### \`functionName(param)\`
 * Опис того, що робить функція.
 */
it("має обробляти базовий випадок", () => {
	const result = functionName("приклад");
	assert.equal(result, "очікуваний_результат");
});
```

В даному випадку:

- Перший коментар `* @docs` парситься як заголовок розділу `## API`
- Тіло тесту `it("Label", () => { ... })` парситься як код прикладу `js\n...\n` до стоп слова.

Щоб замінити ```js на інший тип починай з мультирядкового коментаря з типом:

```js
it("should test", () => {
	/**
	 * ```bash
	 * npm test
	 * ```
	 */
});
```

У результаті буде згенеровано:
```md
should test
```bash
npm test
```
```
