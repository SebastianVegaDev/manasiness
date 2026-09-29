import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

export const REQUEST_ID_RESPONSE_HEADER = 'X-Request-ID';

const requestIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export function resolveRequestId(value: string | readonly string[] | undefined): string {
    if (typeof value === 'string' && requestIdPattern.test(value)) {
        return value;
    }

    return randomUUID();
}
