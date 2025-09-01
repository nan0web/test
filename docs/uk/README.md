# @nan0web/test

|[Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Документація|Тестове покриття|Функції|Версія Npm|
|---|---|---|---|---|
 |🟢 `99.3%` |🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/test/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/test/blob/main/docs/uk/README.md) |🟢 `96.4%` |✅ d.ts 📜 system.md 🕹️ playground |1.0.0 |

Тестовий пакет із простими утилітами для тестування в середовищі node.js.
Розроблено відповідно до [філософії nan0web](https://github.com/nan0web/monorepo/blob/main/system.md#%D0%BD%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%BD%D1%8F-%D1%81%D1%86%D0%B5%D0%BD%D0%B0%D1%80%D1%96%D1%97%D0%B2),
де відсутність залежностей означає максимальну свободу та мінімальні припущення.

Цей пакет допомагає створювати ProvenDocs та структуровані набори даних з прикладів тестів,
особливо корисний для тонкого налаштування LLM.

## Встановлення

Як встановити з npm?
```bash
npm install @nan0web/test
```

Як встановити з pnpm?
```bash
pnpm add @nan0web/test
```

Як встановити з yarn?
```bash
yarn add @nan0web/test
```

## Основні концепції

Цей пакет розроблений без зовнішніх залежностей і з максимальною чіткістю:
- ✅ Повністю типізований за допомогою **JSDoc** та `.d.ts` файлів
- 🔁 Містить утиліти для створення макетів (mock) реальних сценаріїв тестування
- 🧠 Побудований для когнітивної чіткості: кожна функція має чітке призначення
- 🌱 Дозволяє легко тестувати без побічних ефектів

## Використання: Утиліти макетування

### `mockFetch(routes)`
Утиліта для створення макета глобального об'єкта `fetch` для тестів.

* **Параметри**
  * `routes` – масив пар `[pattern, response]` ключ-значення.
    - `pattern` – рядок у форматі `"METHOD PATH"` (наприклад, `"GET /users"`).
    - `response` – значення або масив `[status, body]`.

* **Повертає**
  * `function` – імітатор стандартного API `fetch(url, options)`.

* **Правила зіставлення шляхів**
  - точний збіг: `"GET /users"` збігається лише з цим шляхом
  - довільний метод: `"* /users"` збігається з будь-яким методом для цього шляху
  - довільний шлях: `"GET /users/*"` збігається з `/users/123`
  - універсальний: `"* *"` або `"*"` збігається з усім

  Якщо `response` є `function`, вона викликається з `(method, url, options)`, результат використовується:
  - якщо повертає об'єкт із `.ok` та `.json()`, це стає макетом
  - інакше вважається `[status, data]`, статус за замовчуванням 200

Як створити макет fetch API?
```js
import { mockFetch } from "@nan0web/test"
/** @type {Array<[string, any | any[] | Function]>} */
const routes = [
	['GET /users', { id: 1, name: 'John Doe' }],
	['POST /users', [201, { id: 2, name: 'Jane Smith' }]],
]
const fetch = mockFetch(routes)
const res = await fetch('/users')
const data = await res.json()

console.info(data) // ← { id: 1, name: 'John Doe' }
```

### `MemoryDB(options)`
Утиліта для симуляції файлової системи в тестах.

* **Параметри**
  * `options` – об'єкт параметрів, включає:
    - `predefined` – Map із попередньо визначеними файлами (наприклад, `{ 'users.json': '[{ id: 1 }]' }`)

Як створити макет файлової системи через MemoryDB?
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
Утиліта для створення макета і виконання дочірніх процесів (CLI інструменти).

* **Параметри**
  * `cmd` – команда для запуску (наприклад, `"git"`)
  * `args` – масив аргументів
  * `opts` – необов’язкові опції запуску з обробником `onData`

* **Повертає**
  * `{ code: number, text: string }`

Як використовувати runSpawn як тестовий CLI інструмент?
```js
import { runSpawn } from "@nan0web/test"

const { code, text } = await runSpawn('echo', ['hello world'])

console.info(code) // 0
console.info(text.includes('hello world')) // true

```

### `TestPackage(options)`
Клас для автоматичного перевіряння пакетів за стандартами nan0web.

* **Параметри**
  * `options` – метадані пакета та екземпляр бази даних файлової системи

Як перевірити пакет через TestPackage.run(rrs)?
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
Парсер для вилучення документації з тестів і генерації markdown (ProvenDoc).

Читає js-тести з коментарями, такими як:
```js
it("Як зробити щось?", () => {
  ...
})
```
і перетворює їх на структуровані `.md` документи.

Як генерувати документацію через DocsParser?
```js
import { DocsParser } from "@nan0web/test"

const parser = new DocsParser()
const md = parser.decode(() => {
/**
	 * @docs
	 * # Заголовок
	 * Вміст
 */
	it("Як зробити X?", () => {
		/**
		 * ```js
		 * doX()
		 * ```
		 */
		assert.ok(true)
	})
})

console.info(md) // ← markdown з вмістом коментарів @docs
```

### `DatasetParser`
Парсер, що перетворює markdown документи (як README.md) на структуровані `.jsonl` набори даних.

Кожен блок "Як зробити..." стає окремим тест-кейсом:
```json
{"instruction": "Як зробити X?", "output": "```js\n doX()\n```", ...}
```

Як генерувати набір даних із markdown документації?
```js
import { DatasetParser } from "@nan0web/test"
const md = '# Заголовок\n\nЯк зробити X?\n```js\ndoX()\n```'
const dataset = DatasetParser.parse(md, '@nan0web/test')

console.info(dataset[0].instruction) // ← "Як зробити X?"
```

## Пісочниця

Цей пакет не використовує важкі макети чи віртуальні середовища — він моделює їх легковагими обгортками.
Ви можете експериментувати у пісочниці так:

Як запустити CLI пісочницю?
```bash
git clone https://github.com/nan0web/test.git
cd test
npm install
npm run playground
```

## Компоненти API

Має багато тестових компонентів, що можна імпортувати окремо:
```js
import { mockFetch, MemoryDB, DocsParser, DatasetParser, runSpawn } from "@nan0web/test"

```

## Java•Script типи та автозаповнення
Пакет повністю типізований за допомогою jsdoc і d.ts.

Скільки d.ts файлів має охопити джерело?

## Внесок

Як зробити внесок? – [дивіться тут](https://github.com/nan0web/test/blob/main/CONTRIBUTING.md)

## Ліцензія

ISC – [LICENSE](https://github.com/nan0web/test/blob/main/LICENSE)
