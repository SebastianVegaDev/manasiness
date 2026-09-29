import type { DatabaseClient } from '../connection/database-client.js';

export type DatabaseExecutor = Pick<
    DatabaseClient,
    | '$count'
    | 'delete'
    | 'execute'
    | 'insert'
    | 'select'
    | 'selectDistinct'
    | 'selectDistinctOn'
    | 'update'
>;
