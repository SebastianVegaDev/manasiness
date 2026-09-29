export function uiClassName(...classNames: (string | false | null | undefined)[]): string {
    return classNames
        .filter(
            (className): className is string =>
                typeof className === 'string' && className.length > 0,
        )
        .join(' ');
}
