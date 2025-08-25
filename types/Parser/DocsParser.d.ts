export default DocsParser;
declare class DocsParser extends Parser {
    static SKIP: any[];
    stops: string[];
    /**
     * @param {Function | string} text
     * @returns {Node}
     */
    decode(text: Function | string): Node;
    #private;
}
import { Parser } from "@nan0web/types";
import { Node } from "@nan0web/types";
