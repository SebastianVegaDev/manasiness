import { z } from 'zod';

const machineReadableErrorCodePattern =
    /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/;

export const apiErrorTypeSchema = z.enum([
    'invalid_input',
    'unauthenticated',
    'unauthorized',
    'not_found',
    'conflict',
    'business_rejection',
    'rate_limited',
    'internal_error',
]);

export const apiErrorCodeSchema = z
    .string()
    .regex(
        machineReadableErrorCodePattern,
        'Error codes must use lowercase dot-separated machine-readable segments.',
    );

export const apiValidationIssueSchema =
    z.strictObject({
        path: z.array(
            z.union([
                z.string(),
                z.number().int(),
            ]),
        ),

        message: z.string().min(1),
    });

export const apiErrorSchema = z.strictObject({
    type: apiErrorTypeSchema,

    code: apiErrorCodeSchema,

    message: z.string().min(1),

    issues: z
        .array(apiValidationIssueSchema)
        .optional(),
});

export const apiErrorResponseSchema =
    z.strictObject({
        error: apiErrorSchema,
    });

export const API_ERROR_CODES = {
    INVALID_INPUT: 'transport.invalid_input',
    REQUEST_REJECTED:
        'transport.request_rejected',
    PAYLOAD_TOO_LARGE:
        'transport.payload_too_large',

    UNAUTHENTICATED:
        'auth.unauthenticated',

    UNAUTHORIZED:
        'auth.unauthorized',

    NOT_FOUND:
        'resource.not_found',

    CONFLICT:
        'resource.conflict',

    BUSINESS_REJECTION:
        'business.rejected',

    RATE_LIMITED:
        'rate_limit.exceeded',

    INTERNAL_ERROR:
        'internal.unexpected',
} as const;

export type ApiErrorType = z.output<
    typeof apiErrorTypeSchema
>;

export type ApiValidationIssue = z.output<
    typeof apiValidationIssueSchema
>;

export type ApiError = z.output<
    typeof apiErrorSchema
>;

export type ApiErrorResponse = z.output<
    typeof apiErrorResponseSchema
>;