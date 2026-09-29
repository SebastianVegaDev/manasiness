export interface TransportValidationIssue {
    readonly path: readonly (
        | string
        | number
    )[];

    readonly message: string;
}

export class TransportValidationException extends Error {
    readonly issues: readonly TransportValidationIssue[];

    constructor(
        issues: readonly TransportValidationIssue[],
    ) {
        super('Request validation failed.');

        this.name =
            'TransportValidationException';

        this.issues = Object.freeze(
            issues.map((issue) =>
                Object.freeze({
                    path: Object.freeze([
                        ...issue.path,
                    ]),
                    message: issue.message,
                }),
            ),
        );
    }
}

interface StandardValidationIssueLike {
    readonly message: string;

    readonly path?:
        | readonly unknown[]
        | undefined;
}

export function createTransportValidationException(
    issues: readonly StandardValidationIssueLike[],
): TransportValidationException {
    return new TransportValidationException(
        issues.map((issue) => ({
            path: normalizePath(issue.path),
            message: issue.message,
        })),
    );
}

function normalizePath(
    path: readonly unknown[] | undefined,
): readonly (string | number)[] {
    if (path === undefined) {
        return [];
    }

    return path.map(normalizePathSegment);
}

function normalizePathSegment(
    segment: unknown,
): string | number {
    const value =
        isPathObject(segment)
            ? segment.key
            : segment;

    if (typeof value === 'number') {
        return value;
    }

    return String(value);
}

function isPathObject(
    value: unknown,
): value is {
    readonly key: unknown;
} {
    return (
        typeof value === 'object' &&
        value !== null &&
        'key' in value
    );
}