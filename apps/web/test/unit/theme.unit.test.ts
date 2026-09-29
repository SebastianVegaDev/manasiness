import { expect, test } from 'vitest';

import { parseThemePreference, resolveThemePreference } from '../../src/platform/theme/theme.js';

test('theme preference parser accepts supported values and fails closed to system', () => {
    expect(parseThemePreference('light')).toBe('light');
    expect(parseThemePreference('dark')).toBe('dark');
    expect(parseThemePreference('system')).toBe('system');
    expect(parseThemePreference('unexpected')).toBe('system');
    expect(parseThemePreference(null)).toBe('system');
    expect(parseThemePreference(undefined)).toBe('system');
});

test('system theme preference resolves from the operating-system preference', () => {
    expect(resolveThemePreference('system', false)).toBe('light');
    expect(resolveThemePreference('system', true)).toBe('dark');
    expect(resolveThemePreference('light', true)).toBe('light');
    expect(resolveThemePreference('dark', false)).toBe('dark');
});
