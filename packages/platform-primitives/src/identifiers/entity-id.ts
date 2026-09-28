import {
    validate as validateUuid,
    v7 as uuidV7,
    version as uuidVersion,
} from 'uuid';

declare const entityIdBrand: unique symbol;

export type EntityId = string & {
    readonly [entityIdBrand]: true;
};

const canonicalUuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function generateEntityId(): EntityId {
    return uuidV7() as EntityId;
}

export function parseEntityId(value: string): EntityId {
    const normalizedValue = value.toLowerCase();

    if (!isCanonicalUuidV7(normalizedValue)) {
        throw new TypeError(
            'Expected a canonical RFC 9562 UUIDv7 entity identifier.',
        );
    }

    return normalizedValue as EntityId;
}

export function isEntityId(
    value: unknown,
): value is EntityId {
    if (typeof value !== 'string') {
        return false;
    }

    return isCanonicalUuidV7(value);
}

export function serializeEntityId(
    value: EntityId,
): string {
    return value;
}

function isCanonicalUuidV7(value: string): boolean {
    if (!canonicalUuidPattern.test(value)) {
        return false;
    }

    return (
        validateUuid(value) &&
        uuidVersion(value) === 7
    );
}