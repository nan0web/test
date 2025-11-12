/**
 * @extends {Message}
 */
export class Coverage extends Message {
    static Body: typeof CoverageBody;
    constructor(input: any);
    /** @type {CoverageBody} */
    body: CoverageBody;
}
/**
 * @extends {CLI}
 */
export default class CoverageCommand extends CLI {
    static name: string;
    static help: string;
    static Message: typeof Coverage;
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
     * @param {Coverage} msg
     */
    run(msg?: Coverage): AsyncGenerator<OutputMessage, void, unknown>;
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
        uncovered;
    }>;
}
import { Message } from "@nan0web/co";
declare class CoverageBody {
    constructor(input?: {});
    help: boolean;
}
import { CLI } from "@nan0web/ui-cli";
import { OutputMessage } from "@nan0web/co";
export {};
