/**
 * @extends {CommandMessage}
 */
export class StatusCommandMessage extends CommandMessage {
    constructor(input?: {});
    /** @type {StatusCommandOptions} */
    _opts: StatusCommandOptions;
    /** @param {StatusCommandOptions} value */
    set opts(value: StatusCommandOptions);
    /** @returns {StatusCommandOptions} */
    get opts(): StatusCommandOptions;
}
/**
 * @extends {Command}
 */
export default class StatusCommand extends Command {
    static Message: typeof StatusCommandMessage;
    constructor();
    /**
     * Possible arguments:
     * --hide-name
     * --hide-status
     * --hide-docs
     * --hide-coverage
     * --hide-features
     * --hide-npm
     * --todo
     * --format {md|txt}
     * @param {StatusCommandMessage} msg
     */
    run(msg: StatusCommandMessage): Promise<void>;
}
import { CommandMessage } from "@nan0web/co";
declare class StatusCommandOptions {
    static ALIAS: {
        "hide-name": string;
        "hide-status": string;
        "hide-docs": string;
        "hide-coverage": string;
        "hide-features": string;
        "hide-npm": string;
    };
    /**
     * @param {*} input
     * @returns {StatusCommandOptions}
     */
    static from(input: any): StatusCommandOptions;
    constructor(input?: {});
    /** @type {boolean} */
    help: boolean;
    /** @type {boolean} */
    hide_name: boolean;
    /** @type {boolean} */
    hide_status: boolean;
    /** @type {boolean} */
    hide_docs: boolean;
    /** @type {boolean} */
    hide_coverage: boolean;
    /** @type {boolean} */
    hide_features: boolean;
    /** @type {boolean} */
    hide_npm: boolean;
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
