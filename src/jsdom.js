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

	/**
	 * Create localStorage mock using Map
	 * @type {Object}
	 * @property {Map} _memory - Internal memory storage
	 * @property {Function} getItem - Get item from storage
	 * @property {Function} setItem - Set item in storage
	 * @property {Function} removeItem - Remove item from storage
	 * @property {Function} clear - Clear all items from storage
	 * @property {Function} key - Get key by index
	 * @property {number} length - Number of items in storage
	 */
	const localStorage = {
		_memory: new Map(),

		/**
		 * Get item from localStorage by key
		 * @param {string} key - The key to retrieve
		 * @returns {string|null} The value or null if not found
		 */
		getItem: function(key) {
			return this._memory.get(key) || null
		},

		/**
		 * Set item in localStorage
		 * @param {string} key - The key to set
		 * @param {string} value - The value to store
		 */
		setItem: function(key, value) {
			this._memory.set(key, String(value))
		},

		/**
		 * Remove item from localStorage by key
		 * @param {string} key - The key to remove
		 */
		removeItem: function(key) {
			this._memory.delete(key)
		},

		/**
		 * Clear all items from localStorage
		 */
		clear: function() {
			this._memory.clear()
		},

		/**
		 * Get key by index from localStorage
		 * @param {number} i - The index to retrieve
		 * @returns {string|null} The key or null if not found
		 */
		key: function(i) {
			const keys = Array.from(this._memory.keys())
			return keys[i] || null
		},

		/**
		 * Get the number of items in localStorage
		 * @type {number}
		 */
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
