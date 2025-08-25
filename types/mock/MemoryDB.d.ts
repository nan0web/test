export default MemoryDB;
/**
 * MemoryDB class for testing as mock DB.
 */
declare class MemoryDB extends DB {
    /**
     * @example
     * ```js
     * const db = new MemoryDB({
     * 	predefined: [
     * 		['file1.txt', 'content1'],
     * 		['file2.txt', 'content2'],
     * 	]
     * })
     * await db.connect()
     * const entries = []
     * for await (const entry of db.readDir('.', { depth: 0 })) {
     * 	entries.push(entry)
     * }
     * const content = await db.loadDocument("file1.txt")
     * ```
     * @param {object} input
     * @param {Array | Map} [input.predefined]
     * @param {string} [input.root="."]
     * @param {string} [input.cwd="."]
     * @param {boolean} [input.connected=false]
     * @param {Map<string, any | false>} [input.data=new Map()]
     * @param {Map<string, DocumentStat>} [input.meta=new Map()]
     * @param {DB[]} [input.dbs=[]]
     * { root?: string | undefined; cwd?: string | undefined; connected?: boolean | undefined; data?: Map<string, any> | undefined; meta?: Map<string, DocumentStat> | undefined; dbs?: DB[] | undefined; }'
     */
    constructor(input?: {
        predefined?: any[] | Map<any, any> | undefined;
        root?: string | undefined;
        cwd?: string | undefined;
        connected?: boolean | undefined;
        data?: Map<string, any> | undefined;
        meta?: Map<string, DocumentStat> | undefined;
        dbs?: DB[] | undefined;
    });
    /** @type {Map<string, any>} */
    predefined: Map<string, any>;
    /** @type {Array<{ uri: string, level: string }>} */
    accessLogs: Array<{
        uri: string;
        level: string;
    }>;
    /**
     * @param {string} uri
     * @returns {Promise<DocumentEntry[]>}
     */
    listDir(uri: string): Promise<DocumentEntry[]>;
}
import DB from "@nan0web/db";
import { DocumentEntry } from "@nan0web/db";
import { DocumentStat } from "@nan0web/db";
