export default MemoryDB;
/**
 * MemoryDB class for testing as mock DB.
 * @deprecated Use basic @nan0web/db because it has already all memory functions.
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
     * @param {string} [input.root="."]
     * @param {string} [input.cwd="."]
     * @param {boolean} [input.connected=false]
     * @param {Map<string, any | false>} [input.data=new Map()]
     * @param {Map<string, DocumentStat>} [input.meta=new Map()]
     * @param {DB[]} [input.dbs=[]]
     * { root?: string | undefined; cwd?: string | undefined; connected?: boolean | undefined; data?: Map<string, any> | undefined; meta?: Map<string, DocumentStat> | undefined; dbs?: DB[] | undefined; }'
     */
    constructor(input?: {
        root?: string | undefined;
        cwd?: string | undefined;
        connected?: boolean | undefined;
        data?: Map<string, any> | undefined;
        meta?: Map<string, DocumentStat> | undefined;
        dbs?: DB[] | undefined;
    });
    /** @type {Array<{ uri: string, level: string }>} */
    accessLogs: Array<{
        uri: string;
        level: string;
    }>;
    /**
     * Relative path resolver for file systems.
     * Must be implemented by platform specific code
     * @throws Not implemented in base class
     * @param {string} from Base directory path
     * @param {string} to Target directory path
     * @returns {string} Relative path
     */
    relative(from: string, to: string): string;
}
import DB from "@nan0web/db";
import { DocumentStat } from "@nan0web/db";
