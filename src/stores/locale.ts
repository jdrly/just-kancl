import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const LOCALE_STORAGE_KEY = 'just-kancl-locale';
const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'cs'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function getStoredLocale(): SupportedLocale {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
        return stored as SupportedLocale;
    }
    // Try to detect from browser
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)) {
        return browserLang as SupportedLocale;
    }
    return DEFAULT_LOCALE;
}

export const useLocaleStore = defineStore('locale', () => {
    const locale = ref<SupportedLocale>(getStoredLocale());

    const supportedLocales = computed(() => SUPPORTED_LOCALES);

    function setLocale(newLocale: SupportedLocale) {
        locale.value = newLocale;
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }

    return {
        locale,
        supportedLocales,
        setLocale,
    };
});

