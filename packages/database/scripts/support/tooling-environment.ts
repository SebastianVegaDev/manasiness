import { loadEnvFile } from 'node:process';

const databaseToolingEnvironmentFile = new URL('../../.env', import.meta.url);

export function loadDatabaseToolingEnvironmentFileIfPresent(): void {
    try {
        loadEnvFile(databaseToolingEnvironmentFile);
    } catch (error: unknown) {
        if (isMissingFileError(error)) {
            return;
        }

        throw new Error('Unable to load packages/database/.env.');
    }
}

function isMissingFileError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    const nodeError = error as NodeJS.ErrnoException;

    return nodeError.code === 'ENOENT';
}
