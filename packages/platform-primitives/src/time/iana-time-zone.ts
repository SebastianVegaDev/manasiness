declare const ianaTimeZoneBrand: unique symbol;

export type IanaTimeZone = string & {
    readonly [ianaTimeZoneBrand]: true;
};

export function parseIanaTimeZone(value: string): IanaTimeZone {
    const normalizedValue = resolveIanaTimeZone(value);

    if (normalizedValue === undefined) {
        throw new TypeError('Expected a valid IANA time zone identifier.');
    }

    return normalizedValue as IanaTimeZone;
}

export function isIanaTimeZone(value: unknown): value is IanaTimeZone {
    if (typeof value !== 'string') {
        return false;
    }

    return resolveIanaTimeZone(value) === value;
}

export function serializeIanaTimeZone(value: IanaTimeZone): string {
    return value;
}

function resolveIanaTimeZone(value: string): string | undefined {
    const candidate = value.trim();

    if (candidate.length === 0) {
        return undefined;
    }

    try {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: candidate,
        }).resolvedOptions().timeZone;
    } catch {
        return undefined;
    }
}
