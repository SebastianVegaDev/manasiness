import { z } from 'zod';

declare const localDateBrand: unique symbol;

export type LocalDate = string & {
    readonly [localDateBrand]: true;
};

const localDateSchema = z.iso.date();

export function parseLocalDate(value: string): LocalDate {
    const result = localDateSchema.safeParse(value);

    if (!result.success) {
        throw new TypeError('Expected a valid ISO calendar date in YYYY-MM-DD format.');
    }

    return result.data as LocalDate;
}

export function isLocalDate(value: unknown): value is LocalDate {
    return typeof value === 'string' && localDateSchema.safeParse(value).success;
}

export function serializeLocalDate(value: LocalDate): string {
    return value;
}
