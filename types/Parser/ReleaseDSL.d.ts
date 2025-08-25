export default ReleaseDSL;
/**
 * ReleaseDSL - Domain Specific Language for writing release notes and tasks
 * Provides a simple API for defining releases, sections, and tasks that
 * automatically generates both markdown documentation and executable tests
 */
declare class ReleaseDSL {
    constructor(input?: {});
    /** @type {DB?} */
    db: DB | null;
    /** @type {string} */
    markdown: string;
    /**
     * Initialize a new release
     * @param {string} versionDate - Version and date in format "vX.Y.Z - YYYY-MM-DD"
     * @param {Function} callback - Callback function containing release definition
     */
    version(versionDate: string, callback: Function): void;
    /**
     * Define a section within a release
     * @param {string} title - Section title
     * @param {Function} callback - Callback function containing tasks
     */
    section(title: string, callback: Function): void;
    /**
     * Define a task within a section
     * @param {string} title - Task title
     * @param {Function} callback - Task implementation with acceptance criteria
     * @returns {Promise<void>}
     */
    task(title: string, callback: Function): Promise<void>;
    /**
     * Define text content for a task (AC or description)
     * @param {string} content - Task description/acceptance criteria
     */
    text(content: string): void;
}
import DB from "@nan0web/db-fs";
