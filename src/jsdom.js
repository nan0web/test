import { Window } from 'happy-dom'

/**
 * Global happy-dom setup for node:test environment
 * Creates browser-like DOM environment
 * Automatically called on import - include at top of test files
 *
 * Usage:
 * import "@nan0web/test/jsdom"
 */
function setupDOM() {
	if (globalThis.document && globalThis.window) return

	const window = new Window()
	const document = window.document

	// Create localStorage mock using Map
	const localStorage = {
		_memory: new Map(),
		getItem: function(key) {
			return this._memory.get(key) || null
		},
		setItem: function(key, value) {
			this._memory.set(key, String(value))
		},
		removeItem: function(key) {
			this._memory.delete(key)
		},
		clear: function() {
			this._memory.clear()
		},
		key: function(i) {
			const keys = Array.from(this._memory.keys())
			return keys[i] || null
		},
		get length() {
			return this._memory.size
		}
	}

	Object.assign(globalThis, {
		window,
		document,
		localStorage,
		customElements: window.customElements,
		Element: window.Element,
		HTMLElement: window.HTMLElement,
		Node: window.Node,
		Text: window.Text,
		setTimeout,
		setInterval,
		clearTimeout,
		clearInterval,
		requestAnimationFrame: window.requestAnimationFrame.bind(window),
		cancelAnimationFrame: window.cancelAnimationFrame.bind(window)
	})
}

setupDOM()
