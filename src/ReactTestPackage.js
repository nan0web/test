import TestPackage from "./TestPackage.js"

export default class ReactTestPackage extends TestPackage {
	static DEV_DEPENDENCIES = {
		...TestPackage.DEV_DEPENDENCIES,
		"vitest": "^3.2.4",
		"vite": "^7.1.3",
	}
	static SCRIPTS = {
		...TestPackage.SCRIPTS,
		build: "tsc && vite build",
		test: 'node --test "src/**/*.test.js" && vitest --run',
	}
}
