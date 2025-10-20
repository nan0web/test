/**
 * @extends {CommandMessage}
 */
export class ParseCommandMessage extends CommandMessage {
    constructor(input?: {});
    /** @type {ParseCommandOptions} */
    _opts: ParseCommandOptions;
    /** @param {ParseCommandOptions} value */
    set opts(arg: ParseCommandOptions);
    /** @returns {ParseCommandOptions} */
    get opts(): ParseCommandOptions;
}
/**
 * @extends {Command}
 */
export default class ParseCommand extends Command {
    static Message: typeof ParseCommandMessage;
    constructor();
    /**
     * Possible arguments:
     * --fail
     * --skip
     * --todo
     * --format {md|txt}
     * @param {ParseCommandMessage} msg
     */
    run(msg: ParseCommandMessage): Promise<void>;
    readInput(): Promise<any>;
    toMarkdown(output: any): string;
    toHTML(output: any): string;
}
import { CommandMessage } from "@nan0web/co";
declare class ParseCommandOptions {
    static ALIAS: {
        f: string;
        s: string;
        d: string;
    };
    /**
     * @param {*} input
     * @returns {ParseCommandOptions}
     */
    static from(input: any): ParseCommandOptions;
    constructor(input?: {});
    /** @type {boolean} */
    help: boolean;
    /** @type {boolean} */
    fail: boolean;
    /** @type {boolean} */
    skip: boolean;
    /** @type {boolean} */
    todo: boolean;
    /**
     * Todo output format.
     * One of txt, md, html.
     * @type {string}
     */
    format: string;
}
import { Command } from "@nan0web/co";
export {};
