import {
    expect,
    test,
} from 'vitest';
import { v4 as uuidV4 } from 'uuid';

import {
    generateEntityId,
    isEntityId,
    parseEntityId,
    serializeEntityId,
} from '../../src/index.js';

test('generateEntityId produces canonical UUIDv7 values', () => {
    const id =
        generateEntityId();

    expect(
        isEntityId(id),
    ).toBe(true);

    expect(id).toBe(
        id.toLowerCase(),
    );

    expect(
        serializeEntityId(id),
    ).toBe(id);
});

test('parseEntityId normalizes uppercase UUIDv7 input', () => {
    const generated =
        generateEntityId();

    const parsed =
        parseEntityId(
            generated.toUpperCase(),
        );

    expect(parsed).toBe(
        generated,
    );

    expect(
        isEntityId(parsed),
    ).toBe(true);
});

test('isEntityId only accepts canonical UUIDv7 representation', () => {
    const generated =
        generateEntityId();

    expect(
        isEntityId(generated),
    ).toBe(true);

    expect(
        isEntityId(
            generated.toUpperCase(),
        ),
    ).toBe(false);

    expect(
        isEntityId(uuidV4()),
    ).toBe(false);

    expect(
        isEntityId(
            'not-a-uuid',
        ),
    ).toBe(false);

    expect(
        isEntityId(undefined),
    ).toBe(false);
});

test('parseEntityId rejects other UUID versions', () => {
    expect(() =>
        parseEntityId(
            uuidV4(),
        ),
    ).toThrow(TypeError);
});

test('parseEntityId rejects malformed identifiers', () => {
    expect(() =>
        parseEntityId(
            'not-a-uuid',
        ),
    ).toThrow(TypeError);
});