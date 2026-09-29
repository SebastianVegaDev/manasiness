import {
    Inject,
    Injectable,
    type CallHandler,
    type ExecutionContext,
    type NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { RequestContextService } from './request-context.service.js';

interface RequestWithId {
    readonly id?: unknown;
}

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
    constructor(
        @Inject(RequestContextService)
        private readonly requestContext: RequestContextService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if (context.getType() !== 'http') {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest<RequestWithId>();

        const requestId = normalizeRequestId(request.id);

        if (requestId === undefined) {
            return next.handle();
        }

        return new Observable((subscriber) =>
            this.requestContext.run(
                {
                    requestId,
                },
                () => {
                    const subscription = next.handle().subscribe(subscriber);

                    return () => {
                        subscription.unsubscribe();
                    };
                },
            ),
        );
    }
}

function normalizeRequestId(value: unknown): string | undefined {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return undefined;
}
