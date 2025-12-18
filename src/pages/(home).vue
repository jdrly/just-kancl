<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';

defineOptions({ name: 'HomePage' });
</script>

<template>
    <MainLayout :breadcrumbs="[{ label: 'Dashboard' }]">
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="bg-muted/50 aspect-video rounded-xl" />
            <div class="bg-muted/50 aspect-video rounded-xl" />
            <div class="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div class="bg-muted/50 min-h-[50vh] flex-1 rounded-xl" />
    </MainLayout>
</template>

