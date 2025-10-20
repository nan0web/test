/// <reference types="node" />
/**
 * @typedef {{
 *   code: number;
 *   text: string;
 *   error: string;
 * }} SpawnResult
 */
/**
 * @typedef {{
 *   onData?: (chunk: Buffer) => void;
 *   cwd?: string | URL;
 *   env?: NodeJS.ProcessEnv;
 *   argv0?: string;
 *   stdio?: import('node:child_process').StdioOptions;
 *   detached?: boolean;
 *   shell?: boolean | string;
 *   windowsVerbatimArguments?: boolean;
 *   windowsHide?: boolean;
 *   timeout?: number;
 *   uid?: number;
 *   gid?: number;
 *   serialization?: import('node:child_process').SerializationType;
 *   killSignal?: NodeJS.Signals | number;
 *   signal?: AbortSignal;
 * }} RunSpawnOptions
 */
/**
 * Spawns a child process and returns a promise that resolves when the process closes.
 *
 * @param {string} cmd - The command to run.
 * @param {string[]} [args=[]] - List of arguments to pass to the command.
 * @param {RunSpawnOptions} [opts={}] - Options to pass to spawn.
 *
 * @returns {Promise<SpawnResult>} A promise resolving with process exit code and stdout content.
 *
 * @example
 * const { code, text } = await runSpawn('git', ['remote', 'get-url', 'origin']);
 */
export default function runSpawn(cmd: string, args?: string[] | undefined, opts?: RunSpawnOptions | undefined): Promise<SpawnResult>;
export type SpawnResult = {
    code: number;
    text: string;
    error: string;
};
export type RunSpawnOptions = {
    onData?: ((chunk: Buffer) => void) | undefined;
    cwd?: string | URL | undefined;
    env?: NodeJS.ProcessEnv | undefined;
    argv0?: string | undefined;
    stdio?: import("child_process").StdioOptions | undefined;
    detached?: boolean | undefined;
    shell?: string | boolean | undefined;
    windowsVerbatimArguments?: boolean | undefined;
    windowsHide?: boolean | undefined;
    timeout?: number | undefined;
    uid?: number | undefined;
    gid?: number | undefined;
    serialization?: import("child_process").SerializationType | undefined;
    killSignal?: number | NodeJS.Signals | undefined;
    signal?: AbortSignal | undefined;
};
