/**
 * @extends {Message}
 */
export class ParseMessage extends Message {
    static Body: typeof ParseBody;
    /**
     * @param {any} input
     * @returns {ParseMessage}
     */
    static from(input: any): ParseMessage;
    constructor(input?: {});
    /** @type {ParseBody} */
    body: ParseBody;
}
/**
 * @extends {CLI}
 */
export default class ParseCommand extends CLI {
    static Message: typeof ParseMessage;
    write(str: any): void;
    /**
     * Possible arguments:
     * --fail
     * --skip
     * --todo
     * --format {md|txt}
     * @param {ParseMessage} msg
     * @returns {AsyncGenerator<OutputMessage>}
     */
    run(msg: ParseMessage): AsyncGenerator<OutputMessage>;
    readInput(): Promise<any>;
    toMarkdown(output: any): string;
    toHTML(output: any): string;
}
import { Message } from "@nan0web/co";
declare class ParseBody {
    static help: {
        help: string;
    };
    static fail: {
        help: string;
        alias: string;
    };
    static skip: {
        help: string;
        alias: string;
    };
    static todo: {
        help: string;
        alias: string;
    };
    static format: {
        help: string;
        options: string[];
        defaultValue: string;
    };
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
import { CLI } from "@nan0web/ui-cli";
import { OutputMessage } from "@nan0web/co";
export {};
