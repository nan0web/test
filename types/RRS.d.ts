export default RRS;
/**
 * Criteria that are required for full release readiness.
 * Each criterion contributes significantly to the total score.
 */
export type RRSCriteria = {
    /**
     * - Weight for presence of git repository
     */
    git: number;
    /**
     * - Weight for presence of SYSTEM.md
     */
    systemMd: number;
    /**
     * - Weight for passing test suite
     */
    testPass: number;
    /**
     * - Weight for successful build
     */
    buildPass: number;
    /**
     * - Weight for presence of tsconfig.json
     */
    tsconfig: number;
};
/**
 * Optional criteria that enhance project quality.
 * Each provides bonus points or minor validation.
 */
export type RRSOptionalCriteria = {
    /**
     * - Weight for presence of src/README.md.js
     */
    readmeTest: number;
    /**
     * - Weight for playground or interactive examples
     */
    playground: number;
    /**
     * - Score based on test coverage percentage (0–100)
     */
    testCoverage: number;
    /**
     * - Weight for release documentation (e.g., RELEASE.md)
     */
    releaseMd: number;
    /**
     * - Weight for presence of README.md
     */
    readmeMd: number;
    /**
     * - Weight if package is published to npm
     */
    npmPublished: number;
    /**
     * - Weight if CONTRIBUTING.md and LICENSE exist
     */
    contributingAndLicense: number;
    /**
     * - Map of the translated docs
     */
    translations: Map<any, any>;
};
/**
 * Configuration for Release Readiness Score (RRS).
 * Contains required and optional criteria and the maximum possible score.
 */
declare class RRS {
    static Required: typeof RRSRequired;
    static Optional: typeof RRSOptional;
    /**
     * Returns an RRS instance.
     * If input is already an instance, returns it. Otherwise, creates a new one.
     *
     * @param {RRS | any} input - Input data or existing instance
     * @returns {RRS}
     */
    static from(input: RRS | any): RRS;
    /**
     * Creates a new RRS instance with custom required, optional, and max values.
     *
     * @param {Object} [input] - Configuration options
     * @param {Partial<RRSCriteria>} [input.required] - Override required criteria
     * @param {Partial<RRSOptionalCriteria>} [input.optional] - Override optional criteria
     * @param {string} [input.npmInfo] - NPM info (version)
     * @param {string[]} [input.docs] - Available documentation.
     * @param {number} [input.max] - Custom maximum score
     */
    constructor(input?: {
        required?: Partial<RRSCriteria> | undefined;
        optional?: Partial<RRSOptionalCriteria> | undefined;
        npmInfo?: string | undefined;
        docs?: string[] | undefined;
        max?: number | undefined;
    } | undefined);
    /**
     * Required criteria for baseline readiness.
     * @type {RRSRequired}
     */
    required: RRSRequired;
    /**
     * Optional or bonus criteria that enhance project quality.
     * @type {RRSOptional}
     */
    optional: RRSOptional;
    /**
     * NPM version
     * @type {string}
     */
    npmInfo: string;
    /**
     * Available documentation
     * @type {string[]}
     */
    docs: string[];
    /**
     * Maximum possible score (sum of required + optional weights).
     * Default: (500 required + 124 optional).
     * @type {number}
     */
    max: number;
    /**
     * @returns {number}
     */
    get percentage(): number;
    /**
     * Returns missing (zero-value) properties separated by " "
     * @returns {string}
     */
    get missing(): string;
    /**
     * Returns todo list.
     * @returns {string[]}
     */
    get todo(): string[];
    /**
     * @param {string} [format="`"]
     * @returns {string}
     */
    icon(format?: string | undefined): string;
    /**
     * @param {string} [format="`"]
     * @returns {string}
     */
    coverage(format?: string | undefined): string;
}
/**
 * Release Readiness Score (RRS) calculator.
 * Evaluates project readiness based on required and optional criteria.
 */
/**
 * Criteria that are required for full release readiness.
 * Each criterion contributes significantly to the total score.
 *
 * @typedef {Object} RRSCriteria
 * @property {number} git - Weight for presence of git repository
 * @property {number} systemMd - Weight for presence of SYSTEM.md
 * @property {number} testPass - Weight for passing test suite
 * @property {number} buildPass - Weight for successful build
 * @property {number} tsconfig - Weight for presence of tsconfig.json
 */
/**
 * Optional criteria that enhance project quality.
 * Each provides bonus points or minor validation.
 *
 * @typedef {Object} RRSOptionalCriteria
 * @property {number} readmeTest - Weight for presence of src/README.md.js
 * @property {number} playground - Weight for playground or interactive examples
 * @property {number} testCoverage - Score based on test coverage percentage (0–100)
 * @property {number} releaseMd - Weight for release documentation (e.g., RELEASE.md)
 * @property {number} readmeMd - Weight for presence of README.md
 * @property {number} npmPublished - Weight if package is published to npm
 * @property {number} contributingAndLicense - Weight if CONTRIBUTING.md and LICENSE exist
 * @property {Map} translations - Map of the translated docs
 */
/**
 * Represents required criteria for release readiness.
 * Values can be customized via constructor input.
 */
declare class RRSRequired {
    /**
     * Returns an RRSRequired instance.
     * If input is already an instance, returns it. Otherwise, creates a new one.
     *
     * @param {RRSRequired | any} input - Input data or existing instance
     * @returns {RRSRequired}
     */
    static from(input: RRSRequired | any): RRSRequired;
    /**
     * Creates a new RRSRequired instance with custom values.
     * @param {Partial<RRSCriteria>} [input] - Optional override values
     */
    constructor(input?: Partial<RRSCriteria> | undefined);
    /**
     * Score contribution if git repository exists.
     * @type {number}
     */
    git: number;
    /**
     * Score contribution if SYSTEM.md exists (documentation of architecture).
     * @type {number}
     */
    systemMd: number;
    /**
     * Score contribution if test suite passes.
     * @type {number}
     */
    testPass: number;
    /**
     * Score contribution if build completes successfully.
     * @type {number}
     */
    buildPass: number;
    /**
     * Score contribution if tsconfig.json exists (indicates TypeScript setup).
     * @type {number}
     */
    tsconfig: number;
    /**
     * Returns UTF icon related to a field
     * @param {string} name
     * @returns {string}
     */
    icon(name: string): string;
}
/**
 * Represents optional or bonus criteria for release readiness.
 * Values can be customized via constructor input.
 */
declare class RRSOptional {
    /**
     * Returns an RRSOptional instance.
     * If input is already an instance, returns it. Otherwise, creates a new one.
     *
     * @param {RRSOptional | any} input - Input data or existing instance
     * @returns {RRSOptional}
     */
    static from(input: RRSOptional | any): RRSOptional;
    /**
     * Creates a new RRSOptional instance with custom values.
     * @param {Partial<RRSOptionalCriteria>} [input] - Optional override values
     */
    constructor(input?: Partial<RRSOptionalCriteria> | undefined);
    /**
     * Score if src/README.md.js exists (documentation-driven testing).
     * @type {number}
     */
    readmeTest: number;
    /**
     * Score for presence of playground or example sandbox.
     * @type {number}
     */
    playground: number;
    /**
     * Additional score based on test coverage (0–100).
     * @type {number}
     */
    testCoverage: number;
    /**
     * Score if release documentation (e.g., RELEASE.md) exists.
     * @type {number}
     */
    releaseMd: number;
    /**
     * Score if README.md exists (basic project description).
     * @type {number}
     */
    readmeMd: number;
    /**
     * Score if the package is published to npm.
     * @type {number}
     */
    npmPublished: number;
    /**
     * Score if CONTRIBUTING.md and LICENSE files exist.
     * @type {number}
     */
    contributingAndLicense: number;
    /**
     * Required translations
     */
    translations: Map<any, any>;
    /**
     * Returns UTF icon related to a field
     * @param {string} name
     * @returns {string}
     */
    icon(name: string): string;
}
