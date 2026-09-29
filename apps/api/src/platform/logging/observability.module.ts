import { Module, type DynamicModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { createPinoHttpOptions, type ObservabilityOptions } from './pino-options.js';
import { RequestContextInterceptor } from '../request-context/request-context.interceptor.js';
import { RequestContextService } from '../request-context/request-context.service.js';

@Module({})
export class ObservabilityModule {
    static register(options: ObservabilityOptions): DynamicModule {
        return {
            module: ObservabilityModule,

            global: true,

            imports: [
                LoggerModule.forRoot({
                    pinoHttp: createPinoHttpOptions(options),
                }),
            ],

            providers: [
                RequestContextService,

                {
                    provide: APP_INTERCEPTOR,

                    useClass: RequestContextInterceptor,
                },
            ],

            exports: [RequestContextService],
        };
    }
}
