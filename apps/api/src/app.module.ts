import {
    Module,
    type DynamicModule,
} from '@nestjs/common';

import {
    DatabaseModule,
    type DatabaseModuleOptions,
} from './platform/database/database.module.js';
import { HealthModule } from './platform/health/health.module.js';

interface AppModuleOptions {
    readonly database: DatabaseModuleOptions;
}

@Module({})
export class AppModule {
    static register(
        options: AppModuleOptions,
    ): DynamicModule {
        return {
            module: AppModule,
            imports: [
                DatabaseModule.register(
                    options.database,
                ),
                HealthModule,
            ],
        };
    }
}