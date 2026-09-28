import { loadEnvFile } from 'node:process';
import { URL } from 'node:url';

const apiEnvironmentFile = new URL(
    '../../../.env',
    import.meta.url,
);

export function loadApiEnvironmentFileIfPresent(): void {
    try {
        loadEnvFile(apiEnvironmentFile);
    } catch (error: unknown) {
        if (isMissingFileError(error)) {
            return;
        }

        throw new Error(
            'Unable to load apps/api/.env.',
        );
    }
}

function isMissingFileError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    const nodeError = error as NodeJS.ErrnoException;

    return nodeError.code === 'ENOENT';
}