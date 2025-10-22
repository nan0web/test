export default class TestPackage {
    static COLUMNS: {
        name: string;
        status: string;
        docs: string;
        coverage: string;
        features: string;
        npm: string;
    };
    static STATUS_REF: string;
    static RELATED: string[];
    static SCRIPTS: {
        build: string;
        clean: string;
        "clean:modules": string;
        play: string;
        release: string;
        test: string;
        "test:docs": string;
        "test:release": string;
        "test:coverage": string;
        "test:coverage:collect": string;
        "test:status": string;
        precommit: string;
        prepush: string;
        prepare: string;
    };
    static NPM_FILES: string[];
    static DEV_DEPENDENCIES: {
        "@nan0web/release": string;
        "@nan0web/test": string;
        husky: string;
    };
    static GIT_IGNORED: string[];
    /**
     * @param {*} input
     * @returns {TestPackage}
     */
    static from(input: any): TestPackage;
    /**
     *
     * @param {object} input
     * @param {DB} [input.db]
     * @param {string} [input.cwd]
     * @param {string} [input.name]
     * @param {string} [input.hash]
     * @param {string} [input.baseURL]
     */
    constructor(input: {
        db?: DB | undefined;
        cwd?: string | undefined;
        name?: string | undefined;
        hash?: string | undefined;
        baseURL?: string | undefined;
    });
    /** @type {string} */
    cwd: string;
    /** @type {string} */
    name: string;
    /** @type {string} */
    baseURL: string;
    /** @type {string} */
    hash: string;
    /** @returns {DB} */
    get db(): DB;
    /** @returns {string[]} this.constructor.RELATED */
    get RELATED(): string[];
    get COLUMNS(): {
        name: string;
        status: string;
        docs: string;
        coverage: string;
        features: string;
        npm: string;
    };
    get STATUS_REF(): string;
    get SCRIPTS(): {
        build: string;
        clean: string;
        "clean:modules": string;
        play: string;
        release: string;
        test: string;
        "test:docs": string;
        "test:release": string;
        "test:coverage": string;
        "test:coverage:collect": string;
        "test:status": string;
        precommit: string;
        prepush: string;
        prepare: string;
    };
    get DEV_DEPENDENCIES(): {
        "@nan0web/release": string;
        "@nan0web/test": string;
        husky: string;
    };
    get GIT_IGNORED(): string[];
    get NPM_FILES(): string[];
    /**
     * @param {RRS} rrs
     * @param {*} cache
     * @returns {AsyncGenerator<{ name: string, value: any }>}
     */
    run(rrs: RRS, cache?: any): AsyncGenerator<{
        name: string;
        value: any;
    }, any, any>;
    /**
     * Spawns a child process and returns a promise that resolves when the process closes.
     *
     * @param {string} cmd - The command to run.
     * @param {string[]} [args=[]] - List of arguments to pass to the command.
     * @param {Object} [opts={}] - Options to pass to spawn.
     * @param {(chunk: Buffer) => void} [opts.onData] - Callback for handling data from stdout. Default is no-op.
     * @param {string} [opts.cwd] - Current working directory.
     *
     * @returns {Promise<{ code: number; text: string }>} A promise resolving with process exit code and stdout content.
     *
     * @example
     * const { code, text } = await this.spawn('git', ['remote', 'get-url', 'origin']);
     */
    spawn(cmd: string, args?: string[] | undefined, opts?: {
        onData?: ((chunk: Buffer) => void) | undefined;
        cwd?: string | undefined;
    } | undefined): Promise<{
        code: number;
        text: string;
    }>;
    /**
     * @param {RRS} rrs
     * @param {object} [options]
     * @param {string[]} [options.cols]
     * @param {string[]} [options.features]
     * @param {boolean} [options.head=false] Renders table header if true
     * @param {boolean} [options.body=true] Renders table body if true
     * @param {boolean} [options.refs=true] Renders references to source doc if head is true
     * @param {function} [options.t]
     * @returns {string}
     */
    render(rrs: RRS, options?: {
        cols?: string[] | undefined;
        features?: string[] | undefined;
        head?: boolean | undefined;
        body?: boolean | undefined;
        refs?: boolean | undefined;
        t?: Function | undefined;
    } | undefined): string;
    /**
     * @param {RRS} rrs
     * @returns {MDHeading1}
     */
    toMarkdown(rrs: RRS): MDHeading1;
    toObject(): this & {
        db: Record<string, any>;
    };
    #private;
}
import DB from "@nan0web/db";
import RRS from "./RRS.js";
import { MDHeading1 } from "@nan0web/markdown";
