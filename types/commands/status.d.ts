/**
 * @extends {Message}
 */
export class Status extends Message {
    static name: string;
    static help: string;
    static Body: typeof StatusBody;
    constructor(input: any);
    /** @type {StatusBody} */
    body: StatusBody;
}
/**
 * @extends {CLI}
 */
export default class StatusCommand extends CLI {
    static Message: typeof Status;
    constructor(input?: {});
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
     * @param {Status} msg
     * @returns {AsyncGenerator<OutputMessage>}
     */
    run(msg: Status): AsyncGenerator<OutputMessage>;
}
import Message from "@nan0web/co";
declare class StatusBody {
    static hide_name: {
        alias: string;
        help: string;
    };
    static hide_status: {
        alias: string;
        help: string;
    };
    static hide_docs: {
        alias: string;
        help: string;
    };
    static hide_coverage: {
        alias: string;
        help: string;
    };
    static hide_features: {
        alias: string;
        help: string;
    };
    static hide_npm: {
        alias: string;
        help: string;
    };
    static todo: {
        help: string;
    };
    static format: {
        help: string;
        options: string[];
        defaultValue: string;
    };
    /**
     * @param {*} input
     * @returns {StatusBody}
     */
    static from(input: any): StatusBody;
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
import { CLI } from "@nan0web/ui-cli";
import { OutputMessage } from "@nan0web/co";
export {};
