import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';

export interface RequestContextState {
    readonly requestId: string;
}

@Injectable()
export class RequestContextService {
    private readonly storage = new AsyncLocalStorage<RequestContextState>();

    run<T>(context: RequestContextState, operation: () => T): T {
        return this.storage.run(
            Object.freeze({
                requestId: context.requestId,
            }),
            operation,
        );
    }

    getRequestId(): string | undefined {
        return this.storage.getStore()?.requestId;
    }
}
