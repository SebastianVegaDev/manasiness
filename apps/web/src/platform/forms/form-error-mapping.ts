import type { ApiErrorType, ApiValidationIssue } from '@manasiness/contracts';

import {
    ApiProtocolError,
    ApiResponseError,
    ApiTransportError,
    type ApiTransportFailure,
} from '../api/api-client-error';

export interface ApiFormSubmissionFailure {
    readonly kind: 'api';
    readonly status: number;
    readonly errorType: ApiErrorType;
    readonly code: string;
    readonly issues: readonly ApiValidationIssue[];
    readonly requestId: string | undefined;
}

export interface TransportFormSubmissionFailure {
    readonly kind: 'transport';
    readonly reason: ApiTransportFailure;
    readonly requestId: undefined;
}

export interface ProtocolFormSubmissionFailure {
    readonly kind: 'protocol';
    readonly status: number | undefined;
    readonly requestId: string | undefined;
}

export interface UnexpectedFormSubmissionFailure {
    readonly kind: 'unexpected';
    readonly requestId: undefined;
}

export type FormSubmissionFailure =
    | ApiFormSubmissionFailure
    | TransportFormSubmissionFailure
    | ProtocolFormSubmissionFailure
    | UnexpectedFormSubmissionFailure;

export function mapFormSubmissionError(error: unknown): FormSubmissionFailure {
    if (error instanceof ApiResponseError) {
        return {
            kind: 'api',
            status: error.status,
            errorType: error.apiError.type,
            code: error.apiError.code,
            issues: error.apiError.issues ?? [],
            requestId: error.requestId,
        };
    }

    if (error instanceof ApiTransportError) {
        return {
            kind: 'transport',
            reason: error.reason,
            requestId: undefined,
        };
    }

    if (error instanceof ApiProtocolError) {
        return {
            kind: 'protocol',
            status: error.status,
            requestId: error.requestId,
        };
    }

    return {
        kind: 'unexpected',
        requestId: undefined,
    };
}

export function getFieldValidationIssues(
    failure: FormSubmissionFailure,
    fieldName: string,
): readonly ApiValidationIssue[] {
    if (failure.kind !== 'api') {
        return [];
    }

    return failure.issues.filter((issue) => issue.path[0] === fieldName);
}

export function getUnscopedValidationIssues(
    failure: FormSubmissionFailure,
    knownFieldNames: ReadonlySet<string>,
): readonly ApiValidationIssue[] {
    if (failure.kind !== 'api') {
        return [];
    }

    return failure.issues.filter((issue) => {
        const rootPath = issue.path[0];

        return typeof rootPath !== 'string' || !knownFieldNames.has(rootPath);
    });
}
