export function mergeAriaTokens(...tokens: (string | undefined)[]): string | undefined {
    const merged = tokens.filter(
        (token): token is string => token !== undefined && token.length > 0,
    );

    return merged.length > 0 ? merged.join(' ') : undefined;
}
