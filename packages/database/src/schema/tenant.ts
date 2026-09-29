import { currentTenantOrganizationIdSql } from '../tenant/tenant-setting.js';
import { entityIdColumn } from './primitives.js';

export { currentTenantOrganizationIdSql };

export function tenantOrganizationIdColumn(name = 'organization_id') {
    return entityIdColumn(name).notNull();
}
