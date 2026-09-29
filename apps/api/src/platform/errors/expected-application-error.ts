export type ExpectedApplicationErrorKind =
    | 'unauthenticated'
    | 'unauthorized'
    | 'not_found'
    | 'conflict'
    | 'business_rejection'
    | 'rate_limited';

export interface ExpectedApplicationErrorOptions {
    readonly kind: ExpectedApplicationErrorKind;

    readonly code: string;

    readonly publicMessage: string;
}

export class ExpectedApplicationError extends Error {
    readonly kind: ExpectedApplicationErrorKind;

    readonly code: string;

    readonly publicMessage: string;

    constructor(options: ExpectedApplicationErrorOptions) {
        super(options.publicMessage);

        this.name = 'ExpectedApplicationError';

        this.kind = options.kind;
        this.code = options.code;
        this.publicMessage = options.publicMessage;
    }
}
