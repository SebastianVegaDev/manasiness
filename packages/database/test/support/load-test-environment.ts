import { loadEnvFile } from 'node:process';

const databaseEnvironmentFile = new URL('../../.env', import.meta.url);

export function loadDatabaseTestEnvironmentFileIfPresent(): void {
    try {
        loadEnvFile(databaseEnvironmentFile);
    } catch (error: unknown) {
        if (isMissingFileError(error)) {
            return;
        }

        throw new Error('Unable to load packages/database/.env for database integration tests.');
    }
}

function isMissingFileError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    const nodeError = error as NodeJS.ErrnoException;

    return nodeError.code === 'ENOENT';
}
