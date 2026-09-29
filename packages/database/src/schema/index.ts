export {
    entityIdColumn,
    ianaTimeZoneColumn,
    instantColumn,
    localDateColumn,
} from './primitives.js';

export { currentTenantOrganizationIdSql, tenantOrganizationIdColumn } from './tenant.js';

/**
 * Drizzle product-domain schema entry point.
 *
 * Product-domain tables remain intentionally absent until their
 * owning milestone defines their persistence semantics.
 *
 * Cross-domain technical column conventions may live here when an
 * accepted architecture decision requires one canonical database
 * representation.
 */
