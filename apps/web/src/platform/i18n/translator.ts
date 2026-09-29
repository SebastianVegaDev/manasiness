export type MessageValue = string | number;

export interface MessageCatalog {
    readonly [key: string]: string | MessageCatalog;
}

export type MessageValues = Readonly<Record<string, MessageValue>>;

export type Translator = (key: string, values?: MessageValues) => string;

export function createTranslator(messages: MessageCatalog, namespace?: string): Translator {
    return (key, values) => {
        const qualifiedKey = namespace === undefined ? key : `${namespace}.${key}`;
        const message = resolveMessage(messages, qualifiedKey);

        if (message === null) {
            throw new Error(`Missing localization message: ${qualifiedKey}`);
        }

        return interpolateMessage(message, values);
    };
}

export function getMessageKeys(catalog: MessageCatalog): string[] {
    return collectMessageKeys(catalog).sort((left, right) => left.localeCompare(right));
}

function collectMessageKeys(catalog: MessageCatalog, prefix = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(catalog)) {
        const qualifiedKey = prefix.length === 0 ? key : `${prefix}.${key}`;

        if (typeof value === 'string') {
            keys.push(qualifiedKey);
            continue;
        }

        keys.push(...collectMessageKeys(value, qualifiedKey));
    }

    return keys;
}

function resolveMessage(catalog: MessageCatalog, key: string): string | null {
    const segments = key.split('.');
    let current: string | MessageCatalog = catalog;

    for (const segment of segments) {
        if (typeof current === 'string') {
            return null;
        }

        const next: string | MessageCatalog | undefined = current[segment];

        if (next === undefined) {
            return null;
        }

        current = next;
    }

    return typeof current === 'string' ? current : null;
}

function interpolateMessage(message: string, values: MessageValues | undefined): string {
    return message.replace(/\{([A-Za-z][A-Za-z0-9_.-]*)\}/gu, (_placeholder, key: string) => {
        const value = values?.[key];

        if (value === undefined) {
            throw new Error(`Missing localization value ${key} for message: ${message}`);
        }

        return String(value);
    });
}
