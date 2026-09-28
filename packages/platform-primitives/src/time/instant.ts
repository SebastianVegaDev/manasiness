import { z } from 'zod';

const serializedInstantSchema = z.iso.datetime({
    offset: true,
    precision: 3,
});

export function parseInstant(
    value: string,
): Date {
    const result =
        serializedInstantSchema.safeParse(value);

    if (!result.success) {
        throw new TypeError(
            'Expected an RFC 3339 instant with an explicit timezone and millisecond precision.',
        );
    }

    const instant = new Date(result.data);

    if (!isValidInstant(instant)) {
        throw new TypeError(
            'Expected a valid absolute instant.',
        );
    }

    return instant;
}

export function serializeInstant(
    value: Date,
): string {
    if (!isValidInstant(value)) {
        throw new TypeError(
            'Cannot serialize an invalid instant.',
        );
    }

    return value.toISOString();
}

export function isValidInstant(
    value: unknown,
): value is Date {
    return (
        value instanceof Date &&
        !Number.isNaN(value.getTime())
    );
}