#!/usr/bin/env node
/**
 * @file    packages/app/tests/cli.scenario.test.js
 * @brief   Сценарний тест “CLI – повний цикл” для @nan0web/app/cli.
 *
 * Тестові кроки:
 *   1️⃣  Створюємо тимчасову робочу теку з файлом me.md.
 *   2️⃣  Запускаємо CLI‑додаток, підключаємо «in‑memory» DB та «silent» view.
 *   3️⃣  Імітуємо протокол‑команду, яка повертає просту відповідь.
 *   4️⃣  Перевіряємо, що після першого запиту у view‑логері з’являється
 *       очікуване повідомлення.
 *   5️⃣  Додаємо новий рядок до me.md, генеруємо подію `document.changed`
 *       і перевіряємо, що обробка продовжується.
 *
 * Кожен `it` починається запитом «How to …?» – це документує сценарій
 * і одночасно генерує приклади для `.datasets/…`.
 */

import { describe, it, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import {
	mkdtemp,
	writeFile,
	readFile,
	rm,
	chmod,
} from "node:fs/promises";
import { resolve, join } from "node:path";
import os from "node:os";
import EventEmitter from "node:events";

// ---- 0️⃣ Підготовка «мок‑залежностей» ------------------------------------
import CLIApp from "../../../packages/app/apps/cli/console.js";
import { NoConsole } from "@nan0web/log";

/* ----------------------------------------------------------------------
 * 0.1  In‑memory DB – простий обгортка над базовим DB,
 *      яка не торкається файлової системи.
 * ---------------------------------------------------------------------- */
class InMemoryDB extends EventEmitter {
	constructor() {
		super();
		this._data = new Map();          // key → value (текст / JSON)
		this._meta = new Map();          // meta‑дані (необов’язково)
		this.connected = true;
		this.console = new NoConsole();
	}

	async resolve(uri) {
		// у in‑memory реалізації просто повертаємо сам URI
		return uri;
	}

	async loadDocument(uri, defaultValue = undefined) {
		return this._data.has(uri) ? this._data.get(uri) : defaultValue;
	}

	async saveDocument(uri, doc) {
		this._data.set(uri, doc);
		return true;
	}

	// Методи, які використовуються в CLIApp (тільки під мінімум)
	async get(uri, opts) {
		return this.loadDocument(uri);
	}
}

/* ----------------------------------------------------------------------
 * 0.2  “Silent” view – лише збирає повідомлення у масив, без виводу.
 * ---------------------------------------------------------------------- */
class SilentView {
	constructor() {
		this.logger = new NoConsole();           // без шуму в консолі
		this._messages = [];                     // зібрані рядки
	}

	// Методи, які реальне View викликає у процесі роботи CLIApp.
	// Пишемо їх так, щоб вони лише зберігали інформацію у `_messages`.

	welcome({ cwd } = {}) {
		this._messages.push(`welcome ${cwd}`);
	}

	info(...args) {
		this._messages.push(args.join(" "));
	}

	error(...args) {
		this._messages.push(`ERROR: ${args.join(" ")}`);
	}

	// Додаткові «заглушки», які не змінюються в процесі тесту.
	help() { }
	apiVersion() { }
	debug() { }
	warn() { }
	log() { }
	promptComplete() { return () => { }; }
	waitingForChanges() { return () => { }; }
	starting() { return () => { }; }
	sending() { return () => { }; }
	answering() { return () => { }; }
	taskComplete() { return () => { }; }
	goodbye() { return () => { }; }
	providerNotFound() { return () => { }; }
	providerSelected() { return () => { }; }
	modelNotFound() { return () => { }; }
	modelSelected() { return () => { }; }
	agentNotFound() { return () => { }; }
	agentSelected() { return () => { }; }
	saveFiles() { return () => { }; }
	runTests() { return () => { }; }
	filesSaved() { return () => { }; }
}

/* ----------------------------------------------------------------------
 * 0.3  Фейк‑протокол‑команда.
 *      Після отримання InputMessage повертає простий OutputMessage,
 *      у якому `content` містить рядок «REPLY: <текст>».
 * ---------------------------------------------------------------------- */
class FakeCommandProtocol {
	constructor({ command, db, logger }) {
		this.command = command;      // не використовується, лише для інтерфейсу
		this.db = db;
		this.logger = logger;
	}

	accepts(input) {
		// Приймаємо будь‑яке повідомлення – у сценарії це лише `me.md`‑запит.
		return true;
	}

	async process(input) {
		// Імітуємо «відправку» даних до LLM і «отримання» відповіді.
		const text = await this.db.loadDocument("me.md"); // читаємо поточний промпт
		const reply = `REPLY: ${text?.trim() ?? "empty"}`;
		return {
			content: [reply],
			priority: 0,
			meta: { source: "fake-protocol" },
			error: null,
		};
	}
}

/* ----------------------------------------------------------------------
 * 0.4  Патч для CLIApp – замінюємо реєстрацію протоколу
 *      на наш фейк, тому що в продакшені це робиться динамiчно.
 * ---------------------------------------------------------------------- */
function patchAppWithFakeProtocol(app) {
	const fake = new FakeCommandProtocol({
		command: null,
		db: app.db,
		logger: app.view.logger,
	});
	// InterfaceCore має метод `register`, додаємо протокол
	app.interface.register(fake);
}

/* ----------------------------------------------------------------------
 * 1️⃣  Підготовка тимчасової теки й файлів
 * ---------------------------------------------------------------------- */
let TMP_DIR;          // шлях до тимчасової теки
let ME_MD;            // абсолютний шлях до файлу `me.md`

before(async () => {
	TMP_DIR = await mkdtemp(join(os.tmpdir(), "nan0web-cli-scenario-"));
	ME_MD = resolve(TMP_DIR, "me.md");

	// Створюємо файл‑запит, який одразу «закінчує» промпт `#.` (так працює CLI).
	await writeFile(ME_MD, "Перший запит користувача\n#.", "utf8");
	// Робимо файл читабельним для всіх (на випадок Windows‑доступу)
	await chmod(ME_MD, 0o666);
});

after(async () => {
	// Очистка – видаляємо всю тимчасову структуру
	await rm(TMP_DIR, { recursive: true, force: true });
});

/* ----------------------------------------------------------------------
 * 2️⃣  Сценарний тест
 * ---------------------------------------------------------------------- */
describe("CLI full scenario (initial prompt → second message)", () => {
	let app;            // інстанція CLIApp
	let view;           // наш SilentView
	let db;             // InMemoryDB

	beforeEach(async () => {
		// Очищаємо інстанції перед кожним під‑тестом
		view = new SilentView();
		db = new InMemoryDB();

		// Передаємо готовий DB у додаток; `DB`‑статичний параметр замінюємо на наш.
		CLIApp.DB = class extends InMemoryDB {
			constructor() { super(); }
		};

		app = new CLIApp({
			view,                         // «тихий» інтерфейс
			cwd: TMP_DIR,                 // робоча директорія – наша тимчасова тек
			startCommand: { args: [], opts: {} }, // без параметрів
		});

		// Патчимо інтерфейс, щоб він знав про наш протокол‑команду.
		patchAppWithFakeProtocol(app);
	});

	/** @docs */
	it("How to start the CLI with an existing me.md and get the first reply?", async () => {
		// Запускаємо додаток у фоновому режимі – `run` повертає Promise,
		// який завершиться лише після `app.emit('exit')` або коли `run` завершиться.
		const runPromise = app.run();

		// Дочекаємось коротку паузу, щоб `app.run()` встиг ініціалізувати
		// watchFile‑слухача та запустити `starting`/`welcome`.
		await new Promise(res => setTimeout(res, 150));

		// У SilentView ми накопичуємо повідомлення у `_messages`.
		// Після старту має з’явитися повідомлення про вітання.
		const welcomeMsg = view._messages.find(m => m.includes("welcome"));
		assert.ok(welcomeMsg, "CLI повинно вивести повідомлення про привітання");

		// Дочекаємось, поки наш FakeCommandProtocol обробить перший запит
		// (він читає `me.md` і формує `REPLY: …`). Очікуємо появу такого рядка.
		await new Promise(res => {
			const check = () => {
				const reply = view._messages.find(m => m.includes("REPLY:"));
				if (reply) return res();
				setTimeout(check, 100);
			};
			check();
		});

		// Перевіряємо, чи саме той рядок, який ми очікували.
		const replyLine = view._messages.find(m => m.includes("REPLY:"));
		assert.ok(
			replyLine?.includes("Перший запит користувача"),
			"Відповідь має містити текст першого запиту"
		);

		// Зупиняємо додаток – це важливо, інакше `run` залишиться вічно.
		// У реальному CLI – це робиться через `process.exit`. Тепер просто
		// викликаємо `app.emit('exit')`, якщо такий евент існує, або `app.stop()`.
		if (typeof app.emit === "function") app.emit("exit");
		if (typeof app.stop === "function") app.stop();

		await runPromise; // дожидаємося завершення
	});

	/** @docs */
	it("How to write a second line to me.md and see the system react?", async () => {
		// Запускаємо CLI знову – сценарій починається так само, як у попередньому тесті.
		const runPromise = app.run();
		await new Promise(res => setTimeout(res, 150));

		// Переконуємось, що перший reply вже отримано (можна пропустити,
		// бо ми вже протестували выше, але залишаємо як контроль).
		await new Promise(res => {
			const check = () => {
				const ok = view._messages.some(m => m.includes("REPLY:"));
				if (ok) return res();
				setTimeout(check, 100);
			};
			check();
		});

		// *** 2️⃣  Додаємо новий рядок у файл `me.md` ***
		const additional = "\nНовий рядок після відповіді";
		await writeFile(ME_MD, `Перший запит користувача${additional}\n#.`, "utf8");

		// Емулюємо подію, яку `CLIApp` підписується у `main()` через
		// `watchFile(..., () => app.emit("document.changed", file))`.
		// Ми не маємо прямого доступу до `watchFile`, тому просто
		// викликаємо `emit` вручну.
		if (typeof app.emit === "function") {
			app.emit("document.changed", ME_MD);
		} else {
			// Якщо `app` не є EventEmitter (у нашій мінімальній реалізації –
			// а в реальному коді він успадковується від Core, який є
			// EventEmitter), то можна просто викликати протокол напряму:
			// (необов'язково, бо fake‑протокол вже зареєстрований)
		}

		// Чекаємо, доки `FakeCommandProtocol` знову обробить оновлений файл.
		await new Promise(res => {
			const check = () => {
				// Маємо 2 відповіді: перша та друга. Шукаємо ту, що містить
				// «Новий рядок» у відповіді.
				const second = view._messages.filter(m => m.includes("REPLY:"))[1];
				if (second && second.includes("Новий рядок")) return res();
				setTimeout(check, 100);
			};
			check();
		});

		// Перевіряємо, що друга відповідь містить наш новий рядок.
		const secondReply = view._messages.filter(m => m.includes("REPLY:"))[1];
		assert.ok(
			secondReply?.includes("Новий рядок після відповіді"),
			"Друга відповідь повинна містити новий рядок, який користувач додав"
		);

		// Завершуємо роботу CLI.
		if (typeof app.emit === "function") app.emit("exit");
		if (typeof app.stop === "function") app.stop();
		await runPromise;
	});
});
