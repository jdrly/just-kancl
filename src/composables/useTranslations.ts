import { computed } from 'vue';
import { useConvexQuery } from 'convex-vue';
import { api } from '../../convex/_generated/api';
import { useLocaleStore, type SupportedLocale } from '@/stores/locale';

export function useTranslations() {
    const localeStore = useLocaleStore();

    const { data: translationDoc, isPending: isLoading } = useConvexQuery(
        api.translations.getByLocale,
        computed(() => ({ locale: localeStore.locale }))
    );

    const translations = computed(() => translationDoc.value?.translations ?? {});

    function t(key: string, fallback?: string): string {
        return translations.value[key] ?? fallback ?? key;
    }

    function setLocale(locale: SupportedLocale) {
        localeStore.setLocale(locale);
    }

    return {
        t,
        locale: computed(() => localeStore.locale),
        supportedLocales: localeStore.supportedLocales,
        setLocale,
        isLoading,
    };
}

