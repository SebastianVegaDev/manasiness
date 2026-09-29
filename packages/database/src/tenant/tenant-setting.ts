import { sql } from 'drizzle-orm';

export const TENANT_ORGANIZATION_SETTING_NAME = 'manasiness.organization_id';

export const currentTenantOrganizationIdSql = sql.raw(
    "nullif(current_setting('manasiness.organization_id', true), '')::uuid",
);
