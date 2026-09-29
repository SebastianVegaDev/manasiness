import { THEME_STORAGE_KEY } from './theme';

const serializedThemeStorageKey = JSON.stringify(THEME_STORAGE_KEY);

export const THEME_BOOTSTRAP_SCRIPT = `
(() => {
    try {
        const preference = window.localStorage.getItem(${serializedThemeStorageKey});

        if (preference === 'light' || preference === 'dark') {
            document.documentElement.dataset.theme = preference;
            return;
        }

        document.documentElement.removeAttribute('data-theme');
    } catch {
        document.documentElement.removeAttribute('data-theme');
    }
})();
`;
