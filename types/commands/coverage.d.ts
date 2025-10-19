/**
 * @extends {CommandMessage}
 */
export class CoverageCommandMessage extends CommandMessage {
    constructor(input: any);
    /** @type {CoverageCommandOptions} */
    _opts: CoverageCommandOptions;
    /** @param {CoverageCommandOptions} value */
    set opts(value: CoverageCommandOptions);
    /** @returns {CoverageCommandOptions} */
    get opts(): CoverageCommandOptions;
}
/**
 * @extends {Command}
 */
export default class CoverageCommand extends Command {
    static Message: typeof CoverageCommandMessage;
    constructor();
    /**
     * @docs
     * # `nan0test coverage`
     *
     * Runs test coverage and saves structured report to `.coverage/test.json`.
     *
     * Automatically detects context:
     * - If running in `@nan0web/test`: uses raw Node.js coverage
     * - Else: spawns `node --test` with coverage enabled
     *
     * Output includes line, branch, function coverage and uncovered lines.
     *
     * ```bash
     * nan0test coverage
     * ```
     * @param {CoverageCommandMessage} msg
     */
    run(msg: CoverageCommandMessage): Promise<void>;
    /**
     * Parses coverage lines formatted like:
     *  src/README.md.js | 100 | 100 | 100 |
     *  src/bin/coverage.js | 85.7 | 50 | 100 | 7:8:9
     * @param {string} text
     * @returns {Map<string, { line: number, branch: number, funcs: number, uncovered }>}
     */
    extractCoverage(text: string): Map<string, {
        line: number;
        branch: number;
        funcs: number;
        uncovered: any;
    }>;
}
import { CommandMessage } from "@nan0web/co";
declare class CoverageCommandOptions {
    /**
     * @param {*} input
     * @returns {CoverageCommandOptions}
     */
    static from(input: any): CoverageCommandOptions;
    constructor(input?: {});
    help: boolean;
}
import { Command } from "@nan0web/co";
export {};
