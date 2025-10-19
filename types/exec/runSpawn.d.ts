/** @typedef {{ code: number; text: string, error: string }} SpawnResult */
/**
 * Spawns a child process and returns a promise that resolves when the process closes.
 *
 * @param {string} cmd - The command to run.
 * @param {string[]} [args=[]] - List of arguments to pass to the command.
 * @param {Object} [opts={}] - Options to pass to spawn.
 * @param {(chunk: Buffer) => void} [opts.onData] - Callback for handling data from stdout. Default is no-op.
 * @param {string} [opts.cwd] - Current working directory.
 *
 * @returns {Promise<SpawnResult>} A promise resolving with process exit code and stdout content.
 *
 * @example
 * const { code, text } = await runSpawn('git', ['remote', 'get-url', 'origin']);
 */
export default function runSpawn(cmd: string, args?: string[], opts?: {
    onData?: ((chunk: Buffer) => void) | undefined;
    cwd?: string | undefined;
}): Promise<SpawnResult>;
export type SpawnResult = {
    code: number;
    text: string;
    error: string;
};
