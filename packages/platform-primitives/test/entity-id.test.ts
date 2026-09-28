import assert from 'node:assert/strict';
import test from 'node:test';

import { v4 as uuidV4 } from 'uuid';

import {
    generateEntityId,
    isEntityId,
    parseEntityId,
    serializeEntityId,
} from '../src/index.js';

void test('generateEntityId produces canonical UUIDv7 values', () => {
    const id = generateEntityId();

    assert.equal(isEntityId(id), true);
    assert.equal(id, id.toLowerCase());
    assert.equal(serializeEntityId(id), id);
});

void test('parseEntityId normalizes uppercase UUIDv7 input', () => {
    const generated = generateEntityId();

    const parsed = parseEntityId(
        generated.toUpperCase(),
    );

    assert.equal(parsed, generated);
    assert.equal(isEntityId(parsed), true);
});

void test('isEntityId only accepts canonical UUIDv7 representation', () => {
    const generated = generateEntityId();

    assert.equal(isEntityId(generated), true);
    assert.equal(
        isEntityId(generated.toUpperCase()),
        false,
    );
    assert.equal(isEntityId(uuidV4()), false);
    assert.equal(isEntityId('not-a-uuid'), false);
    assert.equal(isEntityId(undefined), false);
});

void test('parseEntityId rejects other UUID versions', () => {
    assert.throws(
        () => parseEntityId(uuidV4()),
        {
            name: 'TypeError',
        },
    );
});

void test('parseEntityId rejects malformed identifiers', () => {
    assert.throws(
        () => parseEntityId('not-a-uuid'),
        {
            name: 'TypeError',
        },
    );
});