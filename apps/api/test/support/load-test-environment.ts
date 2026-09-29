import {
    loadEnvFile,
} from 'node:process';

const databaseEnvironmentFile =
    new URL(
        '../../../../packages/database/.env',
        import.meta.url,
    );

export function loadApiTestEnvironmentFileIfPresent(): void {
    try {
        loadEnvFile(
            databaseEnvironmentFile,
        );
    } catch (error: unknown) {
        if (
            isMissingFileError(
                error,
            )
        ) {
            return;
        }

        throw new Error(
            'Unable to load packages/database/.env for API integration tests.',
            {
                cause: error,
            },
        );
    }
}

function isMissingFileError(
    error: unknown,
): boolean {
    return (
        error instanceof Error &&
        (
            error as NodeJS.ErrnoException
        ).code === 'ENOENT'
    );
}