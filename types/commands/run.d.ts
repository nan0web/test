/**
 * Command to run all tests and output results to `me.md`.
 * This command executes build, test, and docs test scripts defined in package.json.
 * Results are saved to me.md for later review or integration.
 * @extends {CLI}
 */
export default class RunCommand extends CLI {
    constructor();
    /**
     * Formats a script command and its output for documentation.
     *
     * @param {string} target - The name of the script being run.
     * @param {string} text - The output of the script.
     * @returns {string} - Formatted markdown code block.
     */
    script(target: string, text: string): string;
    /**
     * Executes a child process using spawn.
     *
     * @param {string} cmd - Command to execute.
     * @param {string[]} args - Arguments for the command.
     * @param {Object} opts - Options for spawn.
     * @returns {Promise<{ code: number, text: string, error: string }>} - Result of the spawn operation.
     */
    runSpawn(cmd: string, args: string[], opts: any): Promise<{
        code: number;
        text: string;
        error: string;
    }>;
    /**
     * @docs
     * # `nan0test run`
     *
     * Run all tests and outputs into `me.md`.
     *
     * Automatically detects context from package.json:
     * - scripts{build, test, test:docs}
     *
     * ```bash
     * nan0test run
     * ```
     * @param {Run} msg
     * @returns {AsyncGenerator<OutputMessage, void, unknown>}
     */
    run(msg?: Run): AsyncGenerator<OutputMessage, void, unknown>;
    loadPackageJson(fs: any): Promise<any>;
    /**
     * Saves the test results to a file.
     *
     * @param {FS} fs - The filesystem instance.
     * @param {string} result - The content to save.
     * @returns {Promise<void>} - Promise that resolves when the file is saved.
     */
    saveResult(fs: FS, result: string): Promise<void>;
}
import { CLI } from "@nan0web/ui-cli";
declare class Run extends Message {
    static name: string;
    static help: string;
}
import { OutputMessage } from "@nan0web/co";
import FS from "@nan0web/db-fs";
import Message from "@nan0web/co";
export {};
