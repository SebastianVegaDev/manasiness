import type {
    EntityId,
    IanaTimeZone,
    LocalDate,
} from '@manasiness/platform-primitives';
import {
    date,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

export function entityIdColumn(name: string) {
    return uuid(name).$type<EntityId>();
}

export function instantColumn(name: string) {
    return timestamp(name, {
        withTimezone: true,
        precision: 3,
        mode: 'date',
    });
}

export function localDateColumn(name: string) {
    return date(name, {
        mode: 'string',
    }).$type<LocalDate>();
}

export function ianaTimeZoneColumn(name: string) {
    return text(name).$type<IanaTimeZone>();
}