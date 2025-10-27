/**
 * @extends {CommandMessage}
 */
export class ParseCommandMessage extends CommandMessage {
    /**
     * Create a new ParseCommandMessage instance
     * @param {object} input - Command message properties
     * @param {*} [input.body] - Message body, used only to store original input if it is string
     * @param {string} [input.name] - Command name
     * @param {string[]} [input.argv] - Command arguments
     * @param {object} [input.opts] - Command options
     * @param {object[]} [input.children] - Subcommands in their messages, usually it is only one or zero.
     */
    constructor(input?: {
        body?: any;
        name?: string | undefined;
        argv?: string[] | undefined;
        opts?: object;
        children?: any[] | undefined;
    });
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
    write(str: any): void;
    /**
     * Possible arguments:
     * --fail
     * --skip
     * --todo
     * --format {md|txt}
     * @param {ParseCommandMessage} msg
     */
    run(msg: ParseCommandMessage): Promise<string>;
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
