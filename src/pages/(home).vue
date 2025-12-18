<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/composables/useAuth';
import { useTranslations } from '@/composables/useTranslations';
import { useThemeStore } from '@/stores/theme';

defineOptions({ name: 'HomePage' });

const { user, signOut } = useAuth();
const { t, locale, setLocale } = useTranslations();
const themeStore = useThemeStore();

function toggleLocale() {
    setLocale(locale.value === 'en' ? 'cs' : 'en');
}

function handleThemeToggle() {
    themeStore.toggleDarkMode();
}
</script>

<template>
    <MainLayout :breadcrumbs="[{ label: t('nav.dashboard') }]">
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold">{{ t('dashboard.welcome') }}, {{ user?.name || user?.email || 'User' }}</h1>
                <p class="text-muted-foreground text-sm">{{ locale === 'en' ? 'English' : 'Čeština' }}</p>
            </div>
            <div class="flex items-center gap-4">
                <button 
                    class="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
                    @click="handleThemeToggle"
                >
                    <Switch 
                        id="dark-mode" 
                        :checked="themeStore.isDark" 
                    />
                    <span class="text-sm">
                        {{ themeStore.isDark ? '🌙' : '☀️' }}
                    </span>
                </button>
                <Button variant="ghost" size="sm" @click="toggleLocale">
                    {{ locale === 'en' ? '🇨🇿 CZ' : '🇬🇧 EN' }}
                </Button>
                <Button variant="outline" @click="signOut">{{ t('auth.logout') }}</Button>
            </div>
        </div>

        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="bg-muted/50 aspect-video rounded-xl" />
            <div class="bg-muted/50 aspect-video rounded-xl" />
            <div class="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div class="bg-muted/50 min-h-[50vh] flex-1 rounded-xl" />
    </MainLayout>
</template>
