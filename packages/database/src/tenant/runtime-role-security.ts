import { sql } from 'drizzle-orm';

import type { DatabaseExecutor } from '../transaction/database-executor.js';

interface RuntimeRoleSecurityRow extends Record<string, unknown> {
    readonly roleName: string;
    readonly isSuperuser: boolean;
    readonly bypassesRls: boolean;
    readonly ownsDatabase: boolean;
    readonly canCreateInPublicSchema: boolean;
}

export async function assertRlsSafeRuntimeDatabaseRole(executor: DatabaseExecutor): Promise<void> {
    const result = await executor.execute<RuntimeRoleSecurityRow>(
        sql`
                SELECT
                    role.rolname AS "roleName",
                    role.rolsuper AS "isSuperuser",
                    role.rolbypassrls AS "bypassesRls",
                    database.datdba = role.oid
                        AS "ownsDatabase",
                    has_schema_privilege(
                        role.rolname,
                        'public',
                        'CREATE'
                    ) AS "canCreateInPublicSchema"
                FROM pg_roles AS role
                INNER JOIN pg_database AS database
                    ON database.datname = current_database()
                WHERE role.rolname = current_user
            `,
    );

    const role = result.rows[0];

    if (role === undefined) {
        throw new Error('Unable to inspect the current database runtime role.');
    }

    const unsafeCapabilities: string[] = [];

    if (role.isSuperuser) {
        unsafeCapabilities.push('SUPERUSER');
    }

    if (role.bypassesRls) {
        unsafeCapabilities.push('BYPASSRLS');
    }

    if (role.ownsDatabase) {
        unsafeCapabilities.push('database owner');
    }

    if (role.canCreateInPublicSchema) {
        unsafeCapabilities.push('CREATE privilege on public schema');
    }

    if (unsafeCapabilities.length === 0) {
        return;
    }

    throw new Error(
        `Unsafe database runtime role "${role.roleName}". ` +
            `Application runtime must not have: ${unsafeCapabilities.join(', ')}.`,
    );
}
