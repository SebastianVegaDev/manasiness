import 'server-only';

export function readServerEnvironmentVariable(
    name: string,
): string | undefined {
    return process.env[name];
}