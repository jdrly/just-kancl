import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

const THEME_STORAGE_KEY = 'just-kancl-theme';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
    }
    return 'system';
}

function applyTheme(effectiveTheme: 'light' | 'dark') {
    if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

export const useThemeStore = defineStore('theme', () => {
    const theme = ref<Theme>(getStoredTheme());
    const systemTheme = ref<'light' | 'dark'>(getSystemTheme());

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        systemTheme.value = e.matches ? 'dark' : 'light';
    });

    // Computed effective theme (resolves 'system' to actual theme)
    const effectiveTheme = computed<'light' | 'dark'>(() => {
        return theme.value === 'system' ? systemTheme.value : theme.value;
    });

    // isDark is computed from effectiveTheme
    const isDark = computed(() => effectiveTheme.value === 'dark');

    // Apply theme on initial load
    applyTheme(effectiveTheme.value);

    // Watch for theme changes and apply them
    watch(effectiveTheme, (newTheme) => {
        applyTheme(newTheme);
    });

    // Persist theme preference changes
    watch(theme, (newTheme) => {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    });

    function setTheme(newTheme: Theme) {
        theme.value = newTheme;
    }

    function toggleDarkMode() {
        // When toggling, we switch between light and dark directly
        theme.value = effectiveTheme.value === 'dark' ? 'light' : 'dark';
    }

    return {
        theme,
        isDark,
        effectiveTheme,
        setTheme,
        toggleDarkMode,
    };
});
