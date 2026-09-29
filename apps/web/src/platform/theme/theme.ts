export const THEME_STORAGE_KEY = 'manasiness.theme';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

export function parseThemePreference(value: string | null | undefined): ThemePreference {
    switch (value) {
        case 'light':
        case 'dark':
        case 'system':
            return value;
        default:
            return 'system';
    }
}

export function resolveThemePreference(
    preference: ThemePreference,
    prefersDark: boolean,
): ResolvedTheme {
    if (preference === 'system') {
        return prefersDark ? 'dark' : 'light';
    }

    return preference;
}
