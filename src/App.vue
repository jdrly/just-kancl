<script setup lang="ts">
import { watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useTranslations } from '@/composables/useTranslations';
import { useThemeStore } from '@/stores/theme';

const router = useRouter();
const route = useRoute();
const { isAuthenticated, isLoading: authLoading } = useAuth();
const { isLoading: translationsLoading } = useTranslations();

// Initialize theme store early to apply dark mode on first load
useThemeStore();

const isAppReady = computed(() => !authLoading.value && !translationsLoading.value);

watch(
    [isAuthenticated, authLoading, () => route.meta],
    ([authenticated, loading, meta]) => {
        if (loading) return;

        if (meta.requiresAuth && !authenticated) {
            router.replace('/login');
        } else if (meta.requiresGuest && authenticated) {
            router.replace('/');
        }
    },
    { immediate: true },
);
</script>

<template>
    <RouterView v-if="isAppReady" />
    <div v-else class="flex min-h-svh items-center justify-center bg-background">
        <div class="flex flex-col items-center gap-3">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span class="text-muted-foreground text-sm">Loading...</span>
        </div>
    </div>
</template>
